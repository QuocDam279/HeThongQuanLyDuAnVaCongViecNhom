// services/notification-service/src/jobs/taskReminder.job.js
import cron from 'node-cron';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import Notification from '../models/Notification.js';
import http from '../utils/httpClient.js';
import { sendEmailNotification } from '../controllers/notification.controller.js';

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * 🕒 Job chạy mỗi ngày lúc 8:00 sáng (giờ Việt Nam)
 * Múi giờ Việt Nam = "Asia/Ho_Chi_Minh"
 */
cron.schedule('0 8 * * *', async () => {
  console.log('🕗 [CRON] Kiểm tra task sắp đến hạn...');

  try {
    // Gọi sang Task Service để lấy danh sách task
    const { data: tasks } = await http.task.get('/internal/all');

    const now = dayjs().tz('Asia/Ho_Chi_Minh');
    for (const task of tasks) {
      if (!task.due_date || task.status === 'Done') continue;

      const due = dayjs(task.due_date);
      const diff = due.diff(now, 'day');

      // Nếu còn đúng 2 ngày là đến hạn
      if (diff === 2) {
        const message = `⏰ Công việc "${task.task_name}" sắp đến hạn (${due.format('DD/MM/YYYY')})`;

        const notification = await Notification.create({
          user_id: task.assigned_to,
          task_id: task._id,
          message,
          is_read: false,
          created_at: new Date(),
        });

        await sendEmailNotification(notification);
      }
    }

    console.log('✅ Hoàn tất gửi thông báo sắp hết hạn.');
  } catch (error) {
    console.error('❌ Lỗi trong cron job:', error.message);
  }
}, {
  scheduled: true,
  timezone: 'Asia/Ho_Chi_Minh'
});
