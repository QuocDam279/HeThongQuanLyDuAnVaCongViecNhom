// =====================================================
// TEAM SERVICE - utils/activityLogger.js
// =====================================================
import http from './httpClient.js';

class ActivityLogger {
  static async log({ user_id, action, related_id }) {
    try {
      if (!user_id || !action) {
        console.error('ActivityLogger: Thiếu trường bắt buộc');
        return;
      }

      await http.activity.post('', {
        user_id,
        action,
        related_id,
        related_type: 'team'
      });

      console.log(`✓ Hoạt động team đã ghi: ${action}`);
    } catch (error) {
      console.error('ActivityLogger Lỗi:', error.message);
    }
  }

  static async logTeamCreated(user_id, team_id, teamName = '') {
    const action = teamName 
      ? `Tạo nhóm "${teamName}"` 
      : 'Tạo nhóm mới';
    
    await this.log({ user_id, action, related_id: team_id });
  }

  static async logTeamUpdated(user_id, team_id, changes) {
    let action = 'Cập nhật nhóm';
    
    if (typeof changes === 'object' && changes !== null) {
      const fields = Object.keys(changes).filter(key => key !== '_id' && key !== '__v');
      if (fields.length > 0) {
        action = `Cập nhật nhóm: ${fields.join(', ')}`;
      }
    }
    
    await this.log({ user_id, action, related_id: team_id });
  }

  static async logTeamDeleted(user_id, team_id, teamName = '') {
    const action = teamName 
      ? `Xóa nhóm "${teamName}"` 
      : 'Xóa nhóm';
    
    await this.log({ user_id, action, related_id: team_id });
  }

  static async logTeamMemberAdded(user_id, team_id, memberName) {
    const action = memberName 
      ? `Thêm "${memberName}" vào nhóm` 
      : 'Thêm thành viên vào nhóm';
    
    await this.log({ user_id, action, related_id: team_id });
  }

  static async logTeamMemberRemoved(user_id, team_id, memberName) {
    const action = memberName 
      ? `Xóa "${memberName}" khỏi nhóm` 
      : 'Xóa thành viên khỏi nhóm';
    
    await this.log({ user_id, action, related_id: team_id });
  }

  static async logTeamLeft(user_id, team_id, teamName = '') {
    const action = teamName 
      ? `Rời nhóm "${teamName}"` 
      : 'Rời nhóm';
    
    await this.log({ user_id, action, related_id: team_id });
  }

  static async logTeamRoleChanged(user_id, team_id, memberName, newRole) {
    const action = memberName 
      ? `Thay đổi vai trò của "${memberName}" thành ${newRole}` 
      : `Thay đổi vai trò thành viên thành ${newRole}`;
    
    await this.log({ user_id, action, related_id: team_id });
  }

  static async logTeamLeaderChanged(user_id, team_id, newLeaderName) {
    const action = newLeaderName 
      ? `Chỉ định "${newLeaderName}" làm trưởng nhóm` 
      : 'Thay đổi trưởng nhóm';
    
    await this.log({ user_id, action, related_id: team_id });
  }
}

export default ActivityLogger;
