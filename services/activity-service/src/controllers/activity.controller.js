import ActivityLog from '../models/ActivityLog.js';
import http from '../utils/httpClient.js';
/**
 * 🧱 Ghi log hoạt động
 */
export const createActivity = async (req, res) => {
  try {
    const { user_id, action, related_id, related_type } = req.body;

    if (!user_id || !action || !related_type) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }

    const log = await ActivityLog.create({
      user_id,
      action,
      related_id,
      related_type
    });

    res.status(201).json({ message: 'Tạo log thành công', log });
  } catch (error) {
    console.error('❌ Lỗi createActivity:', error.message);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * 📋 Lấy danh sách log
 */
export const getAllActivities = async (req, res) => {
  try {
    const { user_id, type } = req.query;

    const filter = {};
    if (user_id) filter.user_id = user_id;
    if (type) filter.related_type = type;

    const logs = await ActivityLog.find(filter).sort({ created_at: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * 🔍 Lấy chi tiết log
 */
export const getActivityById = async (req, res) => {
  try {
    const log = await ActivityLog.findById(req.params.id);
    if (!log) return res.status(404).json({ message: 'Không tìm thấy log' });
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

export const getActivityLogsByTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const currentUserId = req.user.id;

    // 1️⃣ Gọi Team Service để kiểm tra vai trò người dùng
    const { data: teamData } = await http.team.get(`/${teamId}`, {
      headers: { Authorization: req.headers.authorization }
    });

    if (!teamData.team)
      return res.status(404).json({ message: 'Không tìm thấy team' });

    const leader = teamData.members.find(m => m.role === 'leader');
    if (!leader || leader.user._id !== currentUserId) {
      return res.status(403).json({ message: 'Chỉ trưởng nhóm mới được xem log nhóm này' });
    }

    // 2️⃣ Lấy danh sách project thuộc team
    const { data: projects } = await http.project.get(`/team/${teamId}`, {
      headers: { Authorization: req.headers.authorization }
    });
    const projectIds = projects.map(p => p._id);

    // 3️⃣ Lấy toàn bộ log liên quan đến team
    const logs = await ActivityLog.find({
      $or: [
        { related_type: 'team', related_id: teamId },
        { related_type: 'project', related_id: { $in: projectIds } },
        { related_type: 'task', related_id: { $in: projectIds } } // nếu sau này có log task
      ]
    }).sort({ created_at: -1 });

    res.json(logs);
  } catch (error) {
    console.error('❌ Lỗi getActivityLogsByTeam:', error.message);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
