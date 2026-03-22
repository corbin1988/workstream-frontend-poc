import { Router } from 'express';
import { listMappingsHandler, getMappingHandler, upsertMappingHandler, deleteMappingHandler } from '../controllers/mappingController';

const router = Router();

// GET /api/mappings?tenant_id=1&provider=jira
router.get('/', listMappingsHandler);

// GET /api/mappings/:projectKey?tenant_id=1&provider=jira
router.get('/:projectKey', getMappingHandler);

// POST /api/mappings
router.post('/', upsertMappingHandler);

// DELETE /api/mappings/:projectKey?tenant_id=1&provider=jira
router.delete('/:projectKey', deleteMappingHandler);

export default router;
