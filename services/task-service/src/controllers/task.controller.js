// controllers/task.controller.js
import mongoose from 'mongoose';
import Task from '../models/Task.js';
import http from '../utils/httpClient.js';
import ActivityLogger from '../utils/activityLogger.js';

/**
 * 🧱 Tạo task mới
 */
export const createTask = async (req, res) => {
  try {
    const {
      project_id,
      task_name,
      description,
      assigned_to,
      start_date,
      due_date,
      priority,
      status = "To Do",
      progress = 0
    } = req.body;

    const created_by = req.user.id;

    // ✅ 1️⃣ Lấy project để kiểm tra team_id và ngày tháng
    const { data: project } = await http.project.get(`/${project_id}`, {
      headers: { Authorization: req.headers.authorization }
    });
    
    if (!project || !project.team_id) {
      return res.status(400).json({ message: 'Không tìm thấy dự án hoặc team_id' });
    }

    // ✅ Kiểm tra ngày task hợp lệ
    const taskStartDate = start_date ? new Date(start_date) : null;
    const taskDueDate = due_date ? new Date(due_date) : null;
    const projectStartDate = project.start_date ? new Date(project.start_date) : null;
    const projectEndDate = project.end_date ? new Date(project.end_date) : null;

    // Kiểm tra: Ngày kết thúc phải sau ngày bắt đầu
    if (taskStartDate && taskDueDate && taskStartDate > taskDueDate) {
      return res.status(400).json({ 
        message: 'Ngày kết thúc phải sau ngày bắt đầu',
        start_date: start_date,
        due_date: due_date
      });
    }

    // Kiểm tra: Ngày bắt đầu task không được trước ngày bắt đầu project
    if (taskStartDate && projectStartDate && taskStartDate < projectStartDate) {
      return res.status(400).json({ 
        message: 'Ngày bắt đầu task không được trước ngày bắt đầu dự án',
        task_start_date: start_date,
        project_start_date: project.start_date
      });
    }

    // Kiểm tra: Ngày kết thúc task không được sau ngày kết thúc project
    if (taskDueDate && projectEndDate && taskDueDate > projectEndDate) {
      return res.status(400).json({ 
        message: 'Ngày kết thúc task không được sau ngày kết thúc dự án',
        task_due_date: due_date,
        project_end_date: project.end_date
      });
    }

    // Kiểm tra: Nếu task có start_date mà project chưa có start_date
    if (taskStartDate && !projectStartDate) {
      return res.status(400).json({ 
        message: 'Dự án chưa có ngày bắt đầu, không thể gán ngày cho task'
      });
    }

    // Kiểm tra: Nếu task có due_date mà project chưa có end_date
    if (taskDueDate && !projectEndDate) {
      return res.status(400).json({ 
        message: 'Dự án chưa có ngày kết thúc, không thể gán deadline cho task'
      });
    }

    // ✅ 2️⃣ Lấy danh sách thành viên team
    const { data: teamData } = await http.team.get(`/${project.team_id}`, {
      headers: { Authorization: req.headers.authorization }
    });
    const memberIds = teamData.members.map(m => m.user_id.toString());

    // ✅ 3️⃣ Kiểm tra xem assigned_to có thuộc team không
    if (!memberIds.includes(assigned_to)) {
      return res.status(403).json({ 
        message: 'Người được giao không thuộc team của dự án này' 
      });
    }

    // ✅ 4️⃣ Tạo task
    const task = await Task.create({
      project_id,
      task_name,
      description,
      assigned_to,
      created_by,
      start_date: taskStartDate || null,
      due_date: taskDueDate || null,
      priority,
      status,
      progress
    });

    // 🧾 Ghi log hoạt động
    await ActivityLogger.logTaskCreated(
      created_by,
      task._id,
      task_name,
      req.headers.authorization
    );

    // 🔄 Cập nhật progress project
    try {
      await http.project.post(
        `/${project_id}/recalc-progress`,
        {},
        { headers: { Authorization: req.headers.authorization } }
      );
    } catch (err) {
      console.warn('⚠ Không thể cập nhật tiến độ project:', err.message);
    }

    res.status(201).json({ message: 'Tạo task thành công', task });
  } catch (error) {
    console.error('❌ Lỗi createTask:', error.message);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * 📋 Lấy tất cả task theo project
 */
export const getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const tasks = await Task.find({ project_id: projectId }).sort({ created_at: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * 🔍 Lấy chi tiết 1 task
 */
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Không tìm thấy task' });

    // 🔹 Gọi Auth service để lấy thông tin user (created_by + assigned_to)
    const userIds = [task.created_by, task.assigned_to].filter(Boolean);

    let users = [];
    if (userIds.length > 0) {
      const { data } = await http.auth.post('/users/info', { ids: userIds });
      users = data;
    }

    // Gắn thông tin user vào task trả về
    const taskObj = task.toObject();
    taskObj.created_by = users.find(u => u._id === task.created_by.toString()) || null;
    taskObj.assigned_to = users.find(u => u._id === task.assigned_to?.toString()) || null;

    res.json(taskObj);
  } catch (error) {
    console.error('❌ Lỗi getTaskById:', error.message);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * ✏️ Cập nhật task
 */
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      task_name,
      description,
      start_date,
      due_date,
      status,
      priority,
      progress,
      assigned_to
    } = req.body;

    // ✅ 1️⃣ Tìm task
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Không tìm thấy công việc' });
    }

    // ✅ 2️⃣ Kiểm tra quyền sửa
    if (
      task.created_by.toString() !== req.user.id &&
      task.assigned_to?.toString() !== req.user.id
    ) {
      return res.status(403).json({ 
        message: 'Bạn không có quyền sửa công việc này' 
      });
    }

    // ✅ 3️⃣ Lấy thông tin project để validate ngày tháng
    const { data: project } = await http.project.get(`/${task.project_id}`, {
      headers: { Authorization: req.headers.authorization }
    });

    if (!project) {
      return res.status(400).json({ message: 'Không tìm thấy dự án' });
    }

    // ✅ 4️⃣ Validate ngày tháng
    const newStartDate = start_date ? new Date(start_date) : task.start_date ? new Date(task.start_date) : null;
    const newDueDate = due_date ? new Date(due_date) : task.due_date ? new Date(task.due_date) : null;
    const projectStartDate = project.start_date ? new Date(project.start_date) : null;
    const projectEndDate = project.end_date ? new Date(project.end_date) : null;

    // Kiểm tra: Ngày kết thúc phải sau ngày bắt đầu
    if (newStartDate && newDueDate && newStartDate > newDueDate) {
      return res.status(400).json({ 
        message: 'Ngày kết thúc phải sau ngày bắt đầu',
        start_date: newStartDate.toISOString(),
        due_date: newDueDate.toISOString()
      });
    }

    // Kiểm tra: Ngày bắt đầu task không được trước ngày bắt đầu project
    if (newStartDate && projectStartDate && newStartDate < projectStartDate) {
      return res.status(400).json({ 
        message: 'Ngày bắt đầu task không được trước ngày bắt đầu dự án',
        task_start_date: newStartDate.toISOString(),
        project_start_date: projectStartDate.toISOString()
      });
    }

    // Kiểm tra: Ngày kết thúc task không được sau ngày kết thúc project
    if (newDueDate && projectEndDate && newDueDate > projectEndDate) {
      return res.status(400).json({ 
        message: 'Ngày kết thúc task không được sau ngày kết thúc dự án',
        task_due_date: newDueDate.toISOString(),
        project_end_date: projectEndDate.toISOString()
      });
    }

    // Kiểm tra: Nếu task có start_date mà project chưa có start_date
    if (newStartDate && !projectStartDate) {
      return res.status(400).json({ 
        message: 'Dự án chưa có ngày bắt đầu, không thể gán ngày cho task'
      });
    }

    // Kiểm tra: Nếu task có due_date mà project chưa có end_date
    if (newDueDate && !projectEndDate) {
      return res.status(400).json({ 
        message: 'Dự án chưa có ngày kết thúc, không thể gán deadline cho task'
      });
    }

    // ✅ 5️⃣ Kiểm tra assigned_to mới
    if (assigned_to && assigned_to !== task.assigned_to?.toString()) {
      if (!project.team_id) {
        return res.status(400).json({ 
          message: 'Không thể xác định team của dự án này' 
        });
      }

      const { data: teamData } = await http.team.get(`/${project.team_id}`, {
        headers: { Authorization: req.headers.authorization }
      });

      const memberIds = teamData.members.map(m => m.user_id?.toString() || m.user?._id?.toString());
      
      if (!memberIds.includes(assigned_to)) {
        return res.status(403).json({
          message: 'Người được giao không thuộc team của dự án này'
        });
      }

      task.assigned_to = assigned_to;
    }

    // ✅ 6️⃣ Cập nhật các trường khác
    if (task_name !== undefined) task.task_name = task_name;
    if (description !== undefined) task.description = description;
    if (start_date !== undefined) task.start_date = newStartDate;
    if (due_date !== undefined) task.due_date = newDueDate;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;

    // ✅ 7️⃣ Xử lý progress
    const oldProgress = task.progress;
    if (progress !== undefined) {
      // Tự động set progress = 100 nếu status = Done
      if (status === 'Done') {
        task.progress = 100;
      }
      // Tự động set progress >= 1 nếu status = In Progress và progress = 0
      else if (status === 'In Progress' && progress === 0) {
        task.progress = 1;
      }
      // Tự động set progress = 0 nếu status = To Do
      else if (status === 'To Do') {
        task.progress = 0;
      }
      else {
        task.progress = Math.min(100, Math.max(0, progress));
      }
    } else if (status !== undefined) {
      // Nếu chỉ update status mà không có progress
      if (status === 'Done') {
        task.progress = 100;
      } else if (status === 'To Do') {
        task.progress = 0;
      } else if (status === 'In Progress' && task.progress === 0) {
        task.progress = 1;
      }
    }

    task.updated_at = new Date();
    await task.save();

    // 🧾 Ghi log hoạt động
    await ActivityLogger.logTaskUpdated(
      req.user.id,
      task._id,
      task.task_name,
      status || task.status,
      req.headers.authorization
    );

    // 🔄 Nếu progress thay đổi → gọi Project Service cập nhật progress
    if (task.progress !== oldProgress) {
      try {
        await http.project.post(
          `/${task.project_id}/recalc-progress`,
          {},
          { headers: { Authorization: req.headers.authorization } }
        );
      } catch (err) {
        console.warn('⚠ Không thể cập nhật tiến độ project:', err.message);
      }
    }

    res.json({ message: 'Cập nhật công việc thành công', task });
  } catch (error) {
    console.error('❌ Lỗi updateTask:', error.message);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * 🗑️ Xóa task
 */
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: 'Không tìm thấy công việc' });

    // Chỉ người tạo mới được xóa
    if (task.created_by.toString() !== req.user.id)
      return res.status(403).json({ message: 'Bạn không có quyền xóa công việc này' });

    const taskName = task.task_name;
    const projectId = task.project_id;

    // Ghi log hoạt động trước khi xóa
    await ActivityLogger.logTaskDeleted(
      req.user.id,
      task._id,
      taskName,
      req.headers.authorization
    );

    // Xóa task
    await task.deleteOne();

    // 🔄 Gọi Project Service để tính lại progress sau khi xóa task
    try {
      await http.project.post(
        `/${projectId}/recalc-progress`,
        {},
        { headers: { Authorization: req.headers.authorization } }
      );
    } catch (err) {
      console.warn('⚠ Không thể cập nhật tiến độ project sau khi xóa task:', err.message);
    }

    res.json({ message: 'Xóa công việc thành công' });
  } catch (error) {
    console.error('❌ Lỗi deleteTask:', error.message);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * 📊 Thống kê trạng thái công việc trong 1 project
 */
export const getTaskStatsByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const stats = await Task.aggregate([
      { $match: { project_id: new mongoose.Types.ObjectId(projectId) } },
      { $group: { _id: '$status', count: { $sum: 1 }, avgProgress: { $avg: '$progress' } } }
    ]);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * 👤 Lấy tất cả task của user hiện tại
 */
export const getMyTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const tasks = await Task.find({ assigned_to: userId }).sort({ due_date: 1 });
    res.json(tasks);
  } catch (error) {
    console.error('❌ Lỗi getMyTasks:', error.message);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * 🧠 Dành cho service nội bộ (Notification, Cron, ...)
 * Lấy tất cả task trong hệ thống (chỉ các trường cần thiết)
 */
export const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find({}, '_id task_name due_date status assigned_to');
    res.json(tasks);
  } catch (error) {
    console.error('❌ Lỗi getAllTasks:', error.message);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * 📦 Batch endpoint - để activity service gọi
 */
export const batchGetTasks = async (req, res) => {
  try {
    const { ids } = req.query;

    if (!ids) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing ids parameter' 
      });
    }

    const idArray = ids.split(',').filter(id => id.trim());
    if (idArray.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // Lấy task
    const tasks = await Task.find({ _id: { $in: idArray } })
      .select('task_name description status priority assigned_to project_id due_date progress created_at')
      .lean();

    // Map task_name → name để ActivityService dùng trực tiếp
    const mapped = tasks.map(task => ({
      ...task,
      name: task.task_name // thêm trường name
    }));

    res.json({ success: true, data: mapped });
  } catch (error) {
    console.error('❌ Error in batch fetch tasks:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching tasks', 
      error: error.message 
    });
  }
};