import { Router } from 'express';
import {
  getWorkItemHandler,
  upsertWorkItemHandler,
  listWorkItemUpdatesHandler,
  createWorkItemUpdateHandler,
} from '../controllers/workItemController';

const router = Router();

router.get('/:issueKey', getWorkItemHandler);
router.post('/', upsertWorkItemHandler);
router.get('/:issueKey/updates', listWorkItemUpdatesHandler);
router.post('/:issueKey/updates', createWorkItemUpdateHandler);

export default router;
