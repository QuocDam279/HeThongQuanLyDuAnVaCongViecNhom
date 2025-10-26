//service/team-service/routes/team.routes.js
import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import {
  createTeam,
  getMyTeams,
  getTeamById,
  addMember,
  removeMember,
  updateTeam,
  deleteTeam
} from '../controllers/team.controller.js';

const router = express.Router();

router.post('/', verifyToken, createTeam);
router.get('/', verifyToken, getMyTeams);
router.get('/:id', verifyToken, getTeamById);
router.post('/:id/members', verifyToken, addMember);
router.delete('/:id/members/:uid', verifyToken, removeMember);
router.put('/:id', verifyToken, updateTeam);
router.delete('/:id', verifyToken, deleteTeam);

export default router;
