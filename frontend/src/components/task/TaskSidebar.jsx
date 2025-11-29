// src/components/task/TaskSidebar.jsx
import React from "react";
import TaskProgressBar from "./TaskProgressBar";
import { updateTask } from "../../services/taskService";

export default function TaskSidebar({ task, onUpdated }) {
  // Map giữa tiếng Việt và giá trị backend
  const statusMap = {
    "Chưa thực hiện": "To Do",
    "Đang thực hiện": "In Progress",
    "Đã hoàn thành": "Done",
  };

  const priorityMap = {
    Thấp: "Low",
    "Trung bình": "Medium",
    Cao: "High",
  };

  const updateField = async (field, value) => {
    const updatedData = {};

    if (field === "status") {
      updatedData.status = statusMap[value];
      if (value === "Đã hoàn thành") updatedData.progress = 100;
      else if (value === "Chưa thực hiện") updatedData.progress = 0;
      else if (task.progress === 100) updatedData.progress = 99;
    } else if (field === "progress") {
      const num = Number(value);
      updatedData.progress = num;
      if (num === 100) updatedData.status = "Done";
      else if (num === 0) updatedData.status = "To Do";
      else if (task.status === "Done" || task.status === "To Do") updatedData.status = "In Progress";
    } else if (field === "priority") {
      updatedData.priority = priorityMap[value];
    }

    try {
      const res = await updateTask(task._id, updatedData);
      onUpdated(res.task);
    } catch (err) {
      console.error("Lỗi cập nhật task:", err);
    }
  };

  const statusValue = Object.keys(statusMap).find(k => statusMap[k] === task.status) || "Chưa thực hiện";
  const priorityValue = Object.keys(priorityMap).find(k => priorityMap[k] === task.priority) || "Trung bình";

  return (
    <div className="w-80 bg-white rounded-2xl shadow p-6 space-y-6">
      {/* Trạng thái & Độ ưu tiên */}
      <div className="space-y-4">
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1">Trạng thái</label>
          <select
            value={statusValue}
            onChange={(e) => updateField("status", e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option>Chưa thực hiện</option>
            <option>Đang thực hiện</option>
            <option>Đã hoàn thành</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1">Độ ưu tiên</label>
          <select
            value={priorityValue}
            onChange={(e) => updateField("priority", e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option>Thấp</option>
            <option>Trung bình</option>
            <option>Cao</option>
          </select>
        </div>
      </div>

      {/* Tiến độ */}
      <div>
        <TaskProgressBar
          progress={task.progress}
          onChange={(val) => updateField("progress", val)}
        />
      </div>

      {/* Ngày tháng */}
      <div className="border-t pt-4 space-y-2 text-sm text-gray-600">
        <div className="flex justify-between bg-gray-50 p-2 rounded">
          <span className="font-medium text-gray-700">Ngày bắt đầu</span>
          <span>{task.start_date ? new Date(task.start_date).toLocaleDateString() : "-"}</span>
        </div>
        <div className="flex justify-between bg-gray-50 p-2 rounded">
          <span className="font-medium text-gray-700">Hạn hoàn thành</span>
          <span>{task.due_date ? new Date(task.due_date).toLocaleDateString() : "-"}</span>
        </div>
        <div className="flex justify-between bg-gray-50 p-2 rounded">
          <span className="font-medium text-gray-700">Ngày tạo</span>
          <span>{task.created_at ? new Date(task.created_at).toLocaleString() : "-"}</span>
        </div>
        <div className="flex justify-between bg-gray-50 p-2 rounded">
          <span className="font-medium text-gray-700">Cập nhật</span>
          <span>{task.updated_at ? new Date(task.updated_at).toLocaleString() : "-"}</span>
        </div>
      </div>

      {/* Người dùng */}
      <div className="border-t pt-4 space-y-2 text-sm">
        <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-400 rounded-full text-white flex items-center justify-center font-semibold">
              {task.created_by?.full_name?.[0] || "C"}
            </span>
            <div>
              <p className="font-semibold text-blue-700">Người tạo</p>
              <p className="text-blue-600 text-sm">{task.created_by?.full_name || task.created_by || "-"}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 bg-green-400 rounded-full text-white flex items-center justify-center font-semibold">
              {task.assigned_to?.full_name?.[0] || "A"}
            </span>
            <div>
              <p className="font-semibold text-green-700">Người được giao</p>
              <p className="text-green-600 text-sm">{task.assigned_to?.full_name || task.assigned_to || "-"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
