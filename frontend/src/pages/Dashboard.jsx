// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import Menu from "../components/common/Menu";
import Header from "../components/common/Header";
import OverviewCards from "../components/dashboard/OverviewCards";
import ProjectList from "../components/dashboard/ProjectList";
import ActivityLog from "../components/dashboard/ActivityLog";
import Calendar from "../components/dashboard/Calendar";
import Status from "../components/dashboard/Status";
import { getMyTasks } from "../services/taskService";

export default function Dashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  const sidebarWidth = collapsed ? "4rem" : "16rem";

  useEffect(() => {
    async function fetchTasks() {
      try {
        setLoadingTasks(true);
        const data = await getMyTasks();
        setTasks(data);
      } catch (error) {
        console.error("Lỗi khi lấy task của user:", error);
      } finally {
        setLoadingTasks(false);
      }
    }

    fetchTasks();
  }, []);

  return (
    <div className="bg-white min-h-screen flex">
      {/* Menu */}
      <Menu collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main content */}
      <div className="flex-1">
        {/* Header */}
        <Header collapsed={collapsed} sidebarWidth={sidebarWidth} />

        {/* Content */}
        <div
          className="pt-24 px-6 space-y-8 transition-all duration-300"
          style={{ marginLeft: sidebarWidth }}
        >
          <OverviewCards />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Project List */}
            <div className="lg:col-span-2 p-6 rounded-2xl shadow">
              <ProjectList />
            </div>

            {/* Right panel: Activity + Status */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow">
                <ActivityLog />
              </div>

              <div className="bg-white p-6 rounded-2xl shadow">
                {loadingTasks ? (
                  <div className="flex items-center justify-center h-48 text-gray-500">
                    Đang tải trạng thái...
                  </div>
                ) : (
                  <Status workItems={tasks} />
                )}
              </div>
            </div>
          </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <Calendar tasks={tasks} />
        </div>
        </div>
      </div>
    </div>
  );
}
