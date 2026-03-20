import { Router } from 'express';
import { createGroup, getGroups, deleteGroup, getGroupById, addMember } from '../controllers/group.controller';

const router = Router();

router.post('/', createGroup);
router.get('/', getGroups);
router.get('/:id', getGroupById);
router.delete('/:id', deleteGroup);
router.post('/:id/members', addMember);

export default router;
