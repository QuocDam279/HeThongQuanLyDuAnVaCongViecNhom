import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { createActivity, getAllActivities, getActivityById, getActivityLogsByTeam } from '../controllers/activity.controller.js';

const router = express.Router();

router.post('/', verifyToken, createActivity);
router.get('/', verifyToken, getAllActivities);
router.get('/:id', verifyToken, getActivityById);
router.get('/team/:teamId', verifyToken, getActivityLogsByTeam);

export default router;
