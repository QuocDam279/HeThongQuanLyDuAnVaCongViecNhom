// src/controllers/notification.controller.js
import Notification from '../models/Notification.js';
import http from '../utils/httpClient.js';

/**
 * 🧱 Tạo thông báo mới
 */
export const createNotification = async (req, res) => {
  try {
    const { user_id, task_id, message } = req.body;
    const notification = await Notification.create({
      user_id,
      task_id,
      message,
      sent_at: null // Chưa gửi mail
    });

    res.status(201).json({ message: 'Tạo thông báo thành công', notification });
  } catch (error) {
    console.error('❌ Lỗi createNotification:', error.message);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * 📬 Lấy tất cả thông báo của user hiện tại
 */
export const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.find({ user_id: userId })
      .sort({ created_at: -1 });
    res.json(notifications);
  } catch (error) {
    console.error('❌ Lỗi getMyNotifications:', error.message);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * 🔍 Lấy chi tiết 1 thông báo
 */
export const getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);
    if (!notification)
      return res.status(404).json({ message: 'Không tìm thấy thông báo' });

    // Gọi sang Task Service để lấy thông tin task liên quan (nếu cần)
    const { data: task } = await http.task.get(`/${notification.task_id}`, {
      headers: { Authorization: req.headers.authorization }
    });

    const notiObj = notification.toObject();
    notiObj.task = task || null;

    res.json(notiObj);
  } catch (error) {
    console.error('❌ Lỗi getNotificationById:', error.message);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * ✏️ Đánh dấu thông báo đã đọc
 */
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findById(id);
    if (!notification)
      return res.status(404).json({ message: 'Không tìm thấy thông báo' });

    if (notification.user_id.toString() !== userId)
      return res.status(403).json({ message: 'Không có quyền chỉnh sửa thông báo này' });

    notification.is_read = true;
    await notification.save();

    res.json({ message: 'Đánh dấu đã đọc thành công', notification });
  } catch (error) {
    console.error('❌ Lỗi markAsRead:', error.message);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * 🗑️ Xóa thông báo
 */
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findById(id);
    if (!notification)
      return res.status(404).json({ message: 'Không tìm thấy thông báo' });

    if (notification.user_id.toString() !== userId)
      return res.status(403).json({ message: 'Không có quyền xóa thông báo này' });

    await notification.deleteOne();

    res.json({ message: 'Xóa thông báo thành công' });
  } catch (error) {
    console.error('❌ Lỗi deleteNotification:', error.message);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * 📢 Gửi mail thông báo (cho cron job hoặc event)
 * - Ví dụ: khi task sắp đến hạn 2 ngày
 */
export const sendEmailNotification = async (notification, req) => {
  try {
    console.log('🚀 [NOTI] Bắt đầu gửi email thông báo...');

    // ✅ Lấy thông tin user từ Auth Service
    const { data: users } = await http.auth.post(
      '/users/info',
      { ids: [notification.user_id] },
      { headers: { Authorization: req?.headers?.authorization } }
    );

    const user = users?.[0];
    if (!user?.email) {
      console.warn('⚠️ Không tìm thấy email của user');
      return;
    }

    console.log(`📡 [NOTI] Gửi mail tới ${user.email}...`);

    // ✅ Gọi Mail Service
    const { data: mailRes } = await http.mail.post('/send', {
      to: user.email,
      subject: '⏰ Task sắp đến hạn!',
      text: notification.message
    });

    console.log('📬 [NOTI] Kết quả phản hồi từ mail-service:', mailRes);

    // ✅ Cập nhật thời gian gửi mail (chỉ lưu nếu là mongoose doc)
    if (typeof notification.save === 'function') {
      notification.sent_at = new Date();
      await notification.save();
    } else {
      console.log('ℹ️ Notification là object thuần, bỏ qua lưu DB');
    }

    console.log(`📧 [NOTI] Đã gửi mail tới ${user.email}`);
  } catch (error) {
    console.error('❌ [NOTI] Lỗi sendEmailNotification:', error);
  }
};

/**
 * 📤 API gửi mail thủ công (qua Postman hoặc Gateway)
 * body: { user_id, task_id, message }
 */
export const sendNotificationMailAPI = async (req, res) => {
  try {
    const { user_id, task_id, message } = req.body;
    if (!user_id || !message)
      return res.status(400).json({ message: 'Thiếu dữ liệu user_id hoặc message' });

    // Tạo đối tượng notification tạm (giống DB model)
    const notification = {
      user_id,
      task_id,
      message,
      sent_at: null
    };

    // Dùng hàm gửi mail sẵn có
    await sendEmailNotification(notification, req);

    return res.json({ message: 'Đã xử lý gửi mail (nếu có email hợp lệ)' });
  } catch (error) {
    console.error('❌ Lỗi sendNotificationMailAPI:', error);
    res.status(500).json({ message: 'Lỗi khi gửi mail', error: error.message });
  }
};