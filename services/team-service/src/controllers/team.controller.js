// controllers/team.controller.js
import http from '../utils/httpClient.js';
import Team from '../models/Team.js';
import TeamMember from '../models/TeamMember.js';

// Tạo team mới
export const createTeam = async (req, res) => {
  try {
    const { team_name, description } = req.body;
    const created_by = req.user.id;

    const team = await Team.create({ team_name, description, created_by });
    await TeamMember.create({ team_id: team._id, user_id: created_by, role: 'leader' });

    res.status(201).json({ message: 'Tạo team thành công', team });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy danh sách team của user
export const getMyTeams = async (req, res) => {
  try {
    const userId = req.user.id;
    const teams = await TeamMember.find({ user_id: userId }).populate('team_id');
    res.json(teams.map(tm => tm.team_id));
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy chi tiết team
export const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Không tìm thấy team' });

    const members = await TeamMember.find({ team_id: team._id });
    if (members.length === 0) return res.json({ team, members: [] });

    const userIds = members.map(m => m.user_id);

    // ✅ Gọi Auth Service qua httpClient
    const { data: users } = await http.auth.post('/users/info', { ids: userIds });

    const membersWithUser = members.map(m => ({
      ...m.toObject(),
      user: users.find(u => u._id === m.user_id.toString()) || null
    }));

    res.json({ team, members: membersWithUser });
  } catch (error) {
    console.error('❌ Lỗi getTeamById:', error.message);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Thêm thành viên
export const addMember = async (req, res) => {
  try {
    const { user_id, role } = req.body;
    const { id } = req.params; // team_id

    const exists = await TeamMember.findOne({ team_id: id, user_id });
    if (exists) return res.status(400).json({ message: 'Thành viên đã tồn tại trong team' });

    const member = await TeamMember.create({ team_id: id, user_id, role });
    res.status(201).json({ message: 'Thêm thành viên thành công', member });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xóa thành viên
export const removeMember = async (req, res) => {
  try {
    const { id, uid } = req.params; // id = team_id, uid = user_id
    await TeamMember.findOneAndDelete({ team_id: id, user_id: uid });
    res.json({ message: 'Xóa thành viên thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Cập nhật thông tin team
export const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { team_name, description } = req.body;

    // Tìm team cần sửa
    const team = await Team.findById(id);
    if (!team) return res.status(404).json({ message: 'Không tìm thấy team' });

    // Kiểm tra quyền: chỉ người tạo mới được sửa
    if (team.created_by.toString() !== req.user.id)
      return res.status(403).json({ message: 'Bạn không có quyền sửa team này' });

    // Cập nhật
    team.team_name = team_name || team.team_name;
    team.description = description || team.description;
    await team.save();

    res.json({ message: 'Cập nhật team thành công', team });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xóa team
export const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;

    const team = await Team.findById(id);
    if (!team) return res.status(404).json({ message: 'Không tìm thấy team' });

    // Chỉ người tạo mới được xóa
    if (team.created_by.toString() !== req.user.id)
      return res.status(403).json({ message: 'Bạn không có quyền xóa team này' });

    // Xóa team và toàn bộ thành viên
    await TeamMember.deleteMany({ team_id: id });
    await team.deleteOne();

    res.json({ message: 'Xóa team thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};



