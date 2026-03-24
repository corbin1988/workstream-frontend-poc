import type { Request, Response } from 'express';
import { WorkItem } from '../models/WorkItem';
import { WorkItemUpdate } from '../models/WorkItemUpdate';
import { TenantConfig } from '../models/TenantConfig';
import { getMapping } from '../repositories/mappingRepository';

const TENANT_ID = '1';

/**
 * GET /api/work-items/:issueKey?provider=jira&projectKey=ABC
 */
export async function getWorkItemHandler(req: Request, res: Response) {
  const issueKey   = String(req.params.issueKey);
  const provider   = String(req.query.provider   ?? 'jira');
  const projectKey = String(req.query.projectKey ?? '');
  try {
    const item = await WorkItem.findOne({
      tenant_id: BigInt(TENANT_ID),
      provider,
      project_key: projectKey,
      issue_key: issueKey,
    }).lean();
    res.setHeader('Cache-Control', 'no-store');
    if (!item) return res.status(404).json({ item: null });
    return res.status(200).json({ item });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch work item';
    return res.status(500).json({ error: message });
  }
}

/**
 * POST /api/work-items — upsert a snapshot
 */
export async function upsertWorkItemHandler(req: Request, res: Response) {
  const {
    provider, project_key, issue_key, jira_issue_id,
    title, description, assignee, status_category,
    priority, due_date, intent_frozen_at,
  } = req.body;

  if (!issue_key || !project_key) {
    return res.status(400).json({ error: 'issue_key and project_key are required' });
  }

  try {
    const doc = await WorkItem.findOneAndUpdate(
      {
        tenant_id: BigInt(TENANT_ID),
        provider: provider ?? 'jira',
        project_key,
        issue_key,
      },
      {
        $set: {
          jira_issue_id:    jira_issue_id   ?? '',
          title:            title           ?? '',
          description:      description     ?? '',
          assignee:         assignee        ?? '',
          status_category:  status_category ?? '',
          priority:         priority        ?? '',
          due_date:         due_date        ?? '',
          intent_frozen_at: intent_frozen_at ? new Date(intent_frozen_at) : null,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ ok: true, id: doc._id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save work item';
    console.error('[upsertWorkItemHandler]', err);
    return res.status(500).json({ error: message });
  }
}

/**
 * GET /api/work-items/:issueKey/updates?projectKey=ABC
 */
export async function listWorkItemUpdatesHandler(req: Request, res: Response) {
  const issueKey   = String(req.params.issueKey);
  const projectKey = req.query.projectKey ? String(req.query.projectKey) : undefined;
  try {
    const updates = await WorkItemUpdate.find({
      tenant_id: BigInt(TENANT_ID),
      issue_key: issueKey,
      ...(projectKey ? { project_key: projectKey } : {}),
    })
      .sort({ review_date: -1 })
      .lean();
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ updates });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch updates';
    return res.status(500).json({ error: message });
  }
}

/**
 * POST /api/work-items/:issueKey/updates — save a review session
 */
export async function createWorkItemUpdateHandler(req: Request, res: Response) {
  const issueKey = String(req.params.issueKey);
  const { provider, project_key, answers, review_date } = req.body;

  if (!project_key || !Array.isArray(answers)) {
    return res.status(400).json({ error: 'project_key and answers[] are required' });
  }

  try {
    const [tenantConfig, mapping] = await Promise.all([
      TenantConfig.findOne({ tenant_id: BigInt(TENANT_ID) }).lean(),
      getMapping(TENANT_ID, provider ?? 'jira', project_key),
    ]);

    const allQuestions = [
      ...(tenantConfig?.task_questions ?? []).map(q => ({ ...q, scope: 'tenant' as const })),
      ...(mapping?.task_questions      ?? []).map(q => ({ ...q, scope: 'project' as const })),
    ];

    const answerMap = new Map(
      (answers as { question_id: string; answer: string }[]).map(a => [a.question_id, a.answer])
    );

    // Zero questions configured → complete by default; otherwise all must be non-empty
    const is_complete =
      allQuestions.length === 0 ||
      allQuestions.every(q => (answerMap.get(q.id) ?? '').trim() !== '');

    const resolvedAnswers = allQuestions.map(q => ({
      question_id:   q.id,
      question_text: q.text,
      answer:        answerMap.get(q.id) ?? '',
      scope:         q.scope,
    }));

    const date = review_date ? new Date(review_date) : new Date();

    const doc = await WorkItemUpdate.findOneAndUpdate(
      { tenant_id: BigInt(TENANT_ID), issue_key: issueKey, review_date: date },
      { $set: { project_key, answers: resolvedAnswers, is_complete } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ ok: true, is_complete, id: doc._id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save work item update';
    console.error('[createWorkItemUpdateHandler]', err);
    return res.status(500).json({ error: message });
  }
}
