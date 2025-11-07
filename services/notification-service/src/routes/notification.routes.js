import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import {
  createNotification,
  getMyNotifications,
  markAsRead,
  deleteNotification,
  sendNotificationMailAPI
} from '../controllers/notification.controller.js';

const router = express.Router();

/**
 * 🧱 Tạo thông báo mới
 * POST /api/notifications
 */
router.post('/', verifyToken, createNotification);

/**
 * 📋 Lấy danh sách thông báo của user hiện tại
 * GET /api/notifications/my
 */
router.get('/my', verifyToken, getMyNotifications);

/**
 * ✉️ Gửi email thông báo (nếu có cron hoặc action)
 * POST /api/notifications/send
 */
router.post('/send', verifyToken, sendNotificationMailAPI);

/**
 * ✅ Đánh dấu thông báo là đã đọc
 * PUT /api/notifications/:id/read
 */
router.put('/:id/read', verifyToken, markAsRead);

/**
 * 🗑️ Xóa thông báo
 * DELETE /api/notifications/:id
 */
router.delete('/:id', verifyToken, deleteNotification);

export default router;
