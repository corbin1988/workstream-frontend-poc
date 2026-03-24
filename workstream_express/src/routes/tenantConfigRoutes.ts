import { Router } from 'express';
import { getTenantConfigHandler, upsertTenantConfigHandler } from '../controllers/tenantConfigController';

const router = Router();

router.get('/', getTenantConfigHandler);
router.put('/', upsertTenantConfigHandler);

export default router;
