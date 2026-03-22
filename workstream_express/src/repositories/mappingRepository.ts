import { WorkItemMapping } from '../models/WorkItemMapping';

/**
 * Fetch one mapping by tenant + provider + project key.
 * Returns null when not found.
 * Used wherever an existing mapping needs to be read for validation or pre-population.
 */
export async function getMapping(tenantId: string, provider: string, projectKey: string) {
  return WorkItemMapping.findOne({
    tenant_id: BigInt(tenantId),
    provider,
    project_key: projectKey,
  }).lean();
}
