// src/pages/ProjectDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Menu from "../components/common/Menu";
import Header from "../components/common/Header";
import ProjectInfo from "../components/project/ProjectInfo";
import TaskList from "../components/task/TaskList";
import CreateTaskButton from "../components/task/CreateTaskButton";
import { getProjectById } from "../services/projectService";
import { getTasksByProject } from "../services/taskService";

export default function ProjectDetail() {
  const { id } = useParams();
  const [collapsed, setCollapsed] = useState(false);

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [tasks, setTasks] = useState([]);
  const [taskLoading, setTaskLoading] = useState(false);

  const sidebarWidth = collapsed ? "4rem" : "16rem";

  const fetchProject = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getProjectById(id);
      setProject(data);
    } catch (err) {
      setError(err.message || "Lỗi khi tải chi tiết dự án");
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    setTaskLoading(true);
    try {
      const data = await getTasksByProject(id);
      setTasks(data);
    } catch (err) {
      console.error("❌ Lỗi fetch tasks:", err.message);
    } finally {
      setTaskLoading(false);
    }
  };

  const handleTaskUpdated = async () => {
    // Refresh task list
    await fetchTasks();
    // Đợi backend tính progress xong
    await new Promise(resolve => setTimeout(resolve, 400));
    // Refresh project info (để lấy progress mới)
    await fetchProject();
  };

  useEffect(() => {
    fetchProject();
    fetchTasks();
  }, [id]);

  if (loading) return <p className="pt-24 px-6">Đang tải chi tiết dự án...</p>;
  if (error) return <p className="pt-24 px-6 text-red-500">{error}</p>;
  if (!project) return <p className="pt-24 px-6">Không tìm thấy dự án</p>;

  return (
    <div className="bg-white min-h-screen flex">
      <Menu collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1">
        <Header collapsed={collapsed} sidebarWidth={sidebarWidth} />
        <div
          className="pt-24 px-6 space-y-8 transition-all duration-300 mb-10"
          style={{ marginLeft: sidebarWidth }}
        >
          {/* Breadcrumb */}
          <div className="text-sm text-gray-500 mb-4 flex items-center gap-2">
            <Link to="/duan" className="hover:text-blue-600 transition-colors">
              Dự án
            </Link>
            <span className="mx-1 text-gray-400">→</span>
            <span
              className="text-gray-700 font-medium max-w-xs truncate"
              title={project.project_name}
            >
              {project.project_name}
            </span>
          </div>

          {/* Project info */}
          <ProjectInfo project={project} />
          <div className="bg-white rounded-2xl border border-gray-200 relative">
            {/* Header sát viền trên */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-lg font-bold text-gray-800">
              Danh sách công việc của dự án
            </div>

            {/* Task list với khoảng padding nhỏ */}
            <div className="mt-6 px-3 py-3 divide-y divide-gray-200 max-h-[500px] overflow-y-auto rounded-b-2xl">
              {taskLoading ? (
                <p className="text-gray-500 text-center py-4">Đang tải công việc...</p>
              ) : tasks.length > 0 ? (
                <TaskList tasks={tasks} onTaskUpdated={handleTaskUpdated} />
              ) : (
                <p className="text-gray-500 text-center py-4">Chưa có công việc nào</p>
              )}
            </div>
          </div>
            <CreateTaskButton
              projectId={id}
              onCreated={handleTaskUpdated}
              members={project.team_members || []}
            />
        </div>
      </div>
    </div>
  );
}
