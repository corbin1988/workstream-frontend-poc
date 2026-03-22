import type { Request, Response } from 'express';
import { WorkItemMapping } from '../models/WorkItemMapping';
import { getMapping } from '../repositories/mappingRepository';

const TENANT_ID = '1';

/**
 * GET /api/mappings?provider=jira
 * List all mappings for the tenant.
 */
export async function listMappingsHandler(req: Request, res: Response) {
  const provider = req.query.provider ? String(req.query.provider) : undefined;

  try {
    const filter: Record<string, unknown> = { tenant_id: BigInt(TENANT_ID) };
    if (provider) filter.provider = provider;
    const mappings = await WorkItemMapping.find(filter).lean();
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ mappings });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to list mappings';
    return res.status(500).json({ error: message });
  }
}

/**
 * GET /api/mappings/:projectKey?provider=jira
 * Fetch a single mapping by project key.
 */
export async function getMappingHandler(req: Request, res: Response) {
  const provider = String(req.query.provider ?? 'jira');
  const projectKey = String(req.params.projectKey);

  try {
    const mapping = await getMapping(TENANT_ID, provider, projectKey);
    res.setHeader('Cache-Control', 'no-store');
    if (!mapping) return res.status(404).json({ mapping: null });
    return res.status(200).json({ mapping });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch mapping';
    return res.status(500).json({ error: message });
  }
}

/**
 * DELETE /api/mappings/:projectKey?provider=jira
 * Delete a mapping by project key.
 */
export async function deleteMappingHandler(req: Request, res: Response) {
  const provider = String(req.query.provider ?? 'jira');
  const projectKey = String(req.params.projectKey);

  try {
    const result = await WorkItemMapping.findOneAndDelete({
      tenant_id: BigInt(TENANT_ID),
      provider,
      project_key: projectKey,
    });
    res.setHeader('Cache-Control', 'no-store');
    if (!result) return res.status(404).json({ ok: false, error: 'Mapping not found' });
    return res.status(200).json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete mapping';
    console.error('[deleteMappingHandler]', err);
    return res.status(500).json({ error: message });
  }
}

/**
 * POST /api/mappings
 * Create or update a mapping.
 */
export async function upsertMappingHandler(req: Request, res: Response) {
  const { provider, project_key, project_name, issue_types, field_mapping, status_mapping } = req.body;

  if (!project_key) {
    return res.status(400).json({ error: 'project_key is required' });
  }

  try {
    const doc = await WorkItemMapping.findOneAndUpdate(
      {
        tenant_id: BigInt(TENANT_ID),
        provider: provider ?? 'jira',
        project_key,
      },
      {
        $set: {
          project_name: project_name ?? '',
          issue_types:  issue_types  ?? [],
          title:        field_mapping?.title       ?? 'summary',
          description:  field_mapping?.description ?? 'description',
          status:       field_mapping?.status      ?? 'status',
          priority:     field_mapping?.priority    ?? 'priority',
          due_date:     field_mapping?.due_date    ?? 'duedate',
          status_mapping: {
            'To Do':       status_mapping?.['To Do']       ?? [],
            'In Progress': status_mapping?.['In Progress'] ?? [],
            'Done':        status_mapping?.['Done']        ?? [],
            'Blocked':     status_mapping?.['Blocked']     ?? [],
          },
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ ok: true, id: doc._id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save mapping';
    console.error('[upsertMappingHandler]', err);
    return res.status(500).json({ error: message });
  }
}
