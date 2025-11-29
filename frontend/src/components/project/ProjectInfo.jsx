// src/components/project/ProjectInfo.jsx
import React, { useEffect, useState } from "react";
import { Calendar, Clock } from "lucide-react";
import ProjectActions from "./ProjectActions";
import Status from "../dashboard/Status";
import { getTasksByProject } from "../../services/taskService";

export default function ProjectInfo({ project }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!project?._id) return;

    const fetchTasks = async () => {
      try {
        setLoading(true);
        const data = await getTasksByProject(project._id);
        setTasks(data);
      } catch (err) {
        console.error("Lỗi khi lấy task:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [project]);

  const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleDateString("vi-VN") : "-";

  return (
    <div className="bg-white p-6 space-y-6 border border-blue-400 rounded-xl">
      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        {/* Left: Thông tin dự án */}
        <div className="flex-1 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
            <h2 className="text-xl font-bold text-indigo-600 truncate border-l-4 border-indigo-500 pl-2">
              {project.project_name}
            </h2>
            <ProjectActions project={project} />
          </div>

          {/* Mô tả */}
          <div className="relative">
            <div className="bg-white p-4 rounded-xl text-gray-700 text-sm border border-gray-200">
              <span className="absolute -top-2 left-3 bg-white text-gray-800 text-xs px-1">
                Mô tả
              </span>
              {project.description || "Chưa có mô tả cho dự án này"}
            </div>
          </div>

          {/* Grid thông tin */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Thời gian */}
            <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <Calendar className="text-indigo-500" size={20} />
              <div>
                <p className="text-xs text-indigo-600 font-medium">Thời gian</p>
                <p className="text-sm font-semibold">
                  {formatDate(project.start_date)} → {formatDate(project.end_date)}
                </p>
              </div>
            </div>

            {/* Tiến độ dự án */}
            <div className="flex flex-col gap-2 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2">
                <Clock className="text-blue-600" size={20} />
                <p className="text-xs text-blue-700 font-medium">Tiến độ dự án</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-2 rounded-full transition-all"
                  style={{ width: `${project.progress || 0}%` }}
                />
              </div>
              <p className="text-xs font-medium text-gray-700 text-right">
                {project.progress || 0}%
              </p>
            </div>
          </div>
        </div>

        {/* Right: Trạng thái task */}
        <div className="w-full lg:w-80 flex-shrink-0 flex flex-col border-l border-gray-200 pl-4">
          {loading ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              Đang tải trạng thái...
            </div>
          ) : (
            <Status workItems={tasks} className="flex-1" />
          )}
        </div>
      </div>
    </div>
  );
}
