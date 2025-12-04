// src/pages/Project.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Menu from "../components/common/Menu";
import Header from "../components/common/Header";
import ProjectList from "../components/project/ProjectList";

import { getMyProjects } from "../services/projectService";
import { getTasksByProject } from "../services/taskService"; // ⬅ thêm file này

export default function Project() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sidebarWidth = collapsed ? "4rem" : "16rem";

  const fetchProjects = async () => {
    setLoading(true);
    setError("");

    try {
      // 1. Lấy danh sách project user tham gia
      const projectList = await getMyProjects();

      // 2. Lấy tasks cho từng project
      const projectsWithTasks = await Promise.all(
        projectList.map(async (project) => {
          try {
            const tasks = await getTasksByProject(project._id);
            return { ...project, tasks };
          } catch {
            return { ...project, tasks: [] }; // fallback
          }
        })
      );

      setProjects(projectsWithTasks);
    } catch (err) {
      setError(err.message || "Lỗi khi tải danh sách dự án");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="bg-white min-h-screen flex">
      <Menu collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className="flex-1">
        <Header collapsed={collapsed} sidebarWidth={sidebarWidth} />

        <div
          className="pt-24 px-6 space-y-8 transition-all duration-300"
          style={{ marginLeft: sidebarWidth }}
        >
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Danh sách dự án</h1>

          {loading ? (
            <p>Đang tải dự án...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : projects.length > 0 ? (
            <ProjectList projects={projects} loading={loading} error={error} />
          ) : (
            <p>Chưa có dự án nào.</p>
          )}
        </div>
      </div>
    </div>
  );
}
