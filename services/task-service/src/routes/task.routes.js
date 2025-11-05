import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import {
  createTask,
  getTasksByProject,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskStatsByProject,
  getMyTasks
} from '../controllers/task.controller.js';

const router = express.Router();

/**
 * 🧱 Tạo công việc mới
 * POST /api/tasks
 */
router.post('/', verifyToken, createTask);

/**
 * 📋 Lấy tất cả task theo project
 * GET /api/tasks/project/:projectId
 */
router.get('/project/:projectId', verifyToken, getTasksByProject);

/**
 * 📊 Lấy thống kê task theo project
 * GET /api/tasks/stats/:projectId
 */
router.get('/stats/:projectId', verifyToken, getTaskStatsByProject);

/**
 * 👤 Lấy tất cả task của user hiện tại
 * GET /api/tasks/my
 */
router.get('/my', verifyToken, getMyTasks);

/**
 * 🔍 Lấy chi tiết 1 task
 * GET /api/tasks/:id
 */
router.get('/:id', verifyToken, getTaskById);

/**
 * ✏️ Cập nhật task
 * PUT /api/tasks/:id
 */
router.put('/:id', verifyToken, updateTask);

/**
 * 🗑️ Xóa task
 * DELETE /api/tasks/:id
 */
router.delete('/:id', verifyToken, deleteTask);

export default router;
