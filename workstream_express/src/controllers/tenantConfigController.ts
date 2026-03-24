import type { Request, Response } from 'express';
import { TenantConfig } from '../models/TenantConfig';

const TENANT_ID = '1';

/**
 * GET /api/tenant-config
 */
export async function getTenantConfigHandler(_req: Request, res: Response) {
  try {
    const config = await TenantConfig.findOne({ tenant_id: BigInt(TENANT_ID) }).lean();
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ config: config ?? { task_questions: [] } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch tenant config';
    return res.status(500).json({ error: message });
  }
}

/**
 * PUT /api/tenant-config
 */
export async function upsertTenantConfigHandler(req: Request, res: Response) {
  const { task_questions } = req.body;
  try {
    const doc = await TenantConfig.findOneAndUpdate(
      { tenant_id: BigInt(TENANT_ID) },
      { $set: { task_questions: Array.isArray(task_questions) ? task_questions : [] } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ ok: true, id: doc._id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save tenant config';
    console.error('[upsertTenantConfigHandler]', err);
    return res.status(500).json({ error: message });
  }
}
