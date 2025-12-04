// routes/activityRoutes.js
import express from 'express';
import {
  createActivityLog,
  getUserActivities,
  getRelatedActivities,
  deleteActivityLog
} from '../controllers/activity.controller.js';

const router = express.Router();

// Create new activity log
router.post('/', createActivityLog);

// Get activities by user
router.get('/user/:user_id', getUserActivities);

// Get activities by related entity (task/project/team)
router.get('/:related_type/:related_id', getRelatedActivities);

// Delete activity log
router.delete('/:id', deleteActivityLog);

export default router;