import React from "react";
import { useNavigate } from "react-router-dom";

export default function TaskItem({ task, onTaskUpdated, hideStatus = false }) {
  const navigate = useNavigate();
  
  const handleClick = () => navigate(`/congviec/${task._id}`);

  const statusStyle = {
    "To Do": "bg-orange-200 text-orange-800",       
    "In Progress": "bg-blue-200 text-blue-800",   
    Done: "bg-pink-200 text-pink-800",           
  };

  const priorityStyle = {
    Low: "bg-green-100 text-green-800",
    Medium: "bg-yellow-100 text-yellow-800",
    High: "bg-red-100 text-red-800",
  };

  return (
    <div
      onClick={handleClick}
      className="rounded-xl border border-blue-300 bg-white p-3 cursor-pointer shadow-sm hover:shadow-md transition-colors"
    >
      <div className="flex justify-between items-start">
        <h2 className="font-medium text-sm text-gray-900 truncate max-w-xs min-w-0">
          {task.task_name}
        </h2>

        <div className="flex gap-1 items-center flex-nowrap">
          {/* Chỉ hiển thị status badge khi hideStatus = false */}
          {!hideStatus && task.status !== "Review" && (
            <span
              className={`px-2 py-0.5 text-[10px] rounded-full font-medium ${statusStyle[task.status]}`}
            >
              {task.status === "To Do"
                ? "Chưa thực hiện"
                : task.status === "In Progress"
                ? "Đang thực hiện"
                : "Đã hoàn thành"}
            </span>
          )}

          <span
            className={`px-2 py-0.5 text-[10px] rounded-full font-medium ${priorityStyle[task.priority]}`}
          >
            {task.priority === "Low"
              ? "Thấp"
              : task.priority === "Medium"
              ? "Trung bình"
              : "Cao"}
          </span>
        </div>
      </div>

      <div className="mt-2">
        <div className="flex justify-between items-center mb-1 text-[10px]">
          <span className="text-gray-600 font-medium">Tiến độ</span>
          <span className="text-gray-700 font-medium">{task.progress}%</span>
        </div>
        <div className="w-full bg-blue-100 h-1.5 rounded-full">
          <div
            className="h-1.5 bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${task.progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
