import React, { useState } from "react";
import { X, Calendar, Flag, Users, FileText, Plus } from "lucide-react";
import { createTask } from "../../services/taskService";

export default function TaskForm({ onClose, projectId, members = [], onTaskCreated }) {
  const todayStr = new Date().toISOString().slice(0, 10);

  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [assignedTo, setAssignedTo] = useState("");
  const [startDate, setStartDate] = useState(todayStr);
  const [dueDate, setDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const priorities = {
    Low: { label: "Thấp", color: "bg-green-500" },
    Medium: { label: "Trung bình", color: "bg-yellow-500" },
    High: { label: "Cao", color: "bg-red-500" }
  };

  const handleCreate = async () => {
    setError("");
    if (!taskName.trim()) return setError("Vui lòng nhập tên công việc!");
    if (!assignedTo) return setError("Vui lòng chọn người được giao!");
    if (startDate && dueDate && startDate > dueDate) {
      return setError("Ngày kết thúc phải sau ngày bắt đầu!");
    }

    setIsSubmitting(true);
    try {
      await createTask({
        task_name: taskName,
        description,
        priority,
        assigned_to: assignedTo,
        project_id: projectId,
        start_date: startDate || null,
        due_date: dueDate || null,
      });
      if (onTaskCreated) onTaskCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Tạo công việc thất bại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Tạo công việc mới</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
            </div>
          )}

          {/* Tên */}
          <div>
            <label className="block text-sm font-medium mb-2">Tên công việc *</label>
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="Nhập tên công việc..."
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-sm font-medium mb-2">Mô tả</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Thêm mô tả..."
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Ngày bắt đầu</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Ngày kết thúc</label>
              <input
                type="date"
                value={dueDate}
                min={startDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium mb-2">Độ ưu tiên</label>
            <div className="flex gap-2">
              {Object.entries(priorities).map(([key, { label, color }]) => (
                <button
                  key={key}
                  onClick={() => setPriority(key)}
                  className={`flex-1 py-2 px-3 rounded-lg border-2 font-medium transition ${
                    priority === key
                      ? `${color} text-white border-transparent`
                      : "bg-white border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Members */}
          <div>
            <label className="block text-sm font-medium mb-2">Giao cho *</label>
            <div className="border rounded-lg p-2 max-h-48 overflow-y-auto space-y-2">
              {members.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">Chưa có thành viên</p>
              ) : (
                members.map((m) => {
                  const user = m.user;
                  if (!user) return null;
                  const selected = assignedTo === user._id;
                  return (
                    <div
                      key={user._id}
                      onClick={() => setAssignedTo(user._id)}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
                        selected ? "bg-blue-100 border-2 border-blue-500" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        selected ? "bg-blue-600" : "bg-gray-400"
                      }`}>
                        {user.full_name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{user.full_name || "Unknown"}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      {selected && <Check size={20} className="text-blue-600" />}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleCreate}
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang tạo...
              </>
            ) : (
              <>
                <Plus size={18} />
                Tạo
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Check({ size, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}