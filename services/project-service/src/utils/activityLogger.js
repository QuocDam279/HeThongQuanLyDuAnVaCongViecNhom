// utils/activityLogger.js
import http from './httpClient.js';

class ActivityLogger {
  static async log({ user_id, action, related_id, token }) {
    try {
      if (!user_id || !action) {
        console.error('❌ ActivityLogger: Missing required fields');
        return;
      }

      await http.activity.post('/', {
        user_id,
        action,
        related_id: related_id || null,
        related_type: 'project'
      }, {
        headers: token ? { Authorization: token } : {}
      });

      console.log(`✓ Activity logged: ${action}`);
    } catch (error) {
      console.error('⚠️ Failed to log activity:', error.response?.status || error.message);
    }
  }

  static async logProjectCreated(user_id, project_id, projectName, token) {
    const action = `Tạo dự án mới: ${projectName}`;
    await this.log({ user_id, action, related_id: project_id, token });
  }

  static async logProjectUpdated(user_id, project_id, projectName, token) {
    const action = `Cập nhật dự án: ${projectName}`;
    await this.log({ user_id, action, related_id: project_id, token });
  }

  static async logProjectDeleted(user_id, project_id, projectName, token) {
    const action = `Xóa dự án: ${projectName}`;
    await this.log({ user_id, action, related_id: project_id, token });
  }

  static async logProjectStatusChanged(user_id, project_id, projectName, oldStatus, newStatus, token) {
    const action = `Thay đổi trạng thái dự án: ${projectName} (${oldStatus} → ${newStatus})`;
    await this.log({ user_id, action, related_id: project_id, token });
  }

  static async logProjectProgressUpdated(user_id, project_id, projectName, progress, token) {
    const action = `Cập nhật tiến độ dự án: ${projectName} (${progress}%)`;
    await this.log({ user_id, action, related_id: project_id, token });
  }
}

export default ActivityLogger;