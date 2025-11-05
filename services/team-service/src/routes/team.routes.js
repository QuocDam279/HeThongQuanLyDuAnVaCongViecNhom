//service/team-service/routes/team.routes.js
import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import {
  createTeam,
  getMyTeams,
  getTeamById,
  addMember,
  removeMember,
  updateTeam,
  deleteTeam
} from '../controllers/team.controller.js';

const router = express.Router();

router.post('/', verifyToken, createTeam);// Tạo team mới
router.get('/', verifyToken, getMyTeams);// Lấy tất cả team của user hiện tại
router.get('/:id', verifyToken, getTeamById);// Lấy chi tiết 1 team
router.post('/:id/members', verifyToken, addMember);// Thêm thành viên vào team
router.delete('/:id/members/:uid', verifyToken, removeMember);// Xóa thành viên khỏi team
router.put('/:id', verifyToken, updateTeam);// Cập nhật thông tin team
router.delete('/:id', verifyToken, deleteTeam);// Xóa team

export default router;
