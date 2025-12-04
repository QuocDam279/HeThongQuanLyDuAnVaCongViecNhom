// src/pages/TaskDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Menu from "../components/common/Menu";
import Header from "../components/common/Header";

import { getTaskById } from "../services/taskService";

import TaskHeader from "../components/task/TaskHeader";
import TaskSidebar from "../components/task/TaskSidebar";


import NameTeamProject from "../components/task/NameTeamProject";

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const sidebarWidth = collapsed ? "4rem" : "16rem";

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Lấy thông tin user hiện tại từ localStorage
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Lấy user từ localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  const loadTask = async () => {
    try {
      const data = await getTaskById(id);
      setTask(data);
    } catch (error) {
      console.error("Lỗi khi tải task:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTask();
  }, [id]);

  const handleDeleted = () => {
    navigate("/congviec");
  };

  if (loading) return <p className="pt-24 px-6">Đang tải công việc...</p>;
  if (!task) return <p className="pt-24 px-6">Không tìm thấy công việc</p>;

  return (
    <div className="bg-gray-50 min-h-screen flex">
      <Menu collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className="flex-1">
        <Header collapsed={collapsed} sidebarWidth={sidebarWidth} />

        <div
          className="pt-24 px-8 transition-all duration-300"
          style={{ marginLeft: sidebarWidth }}
        >
          <div className="max-w-6xl mx-auto flex gap-8">

            {/* LEFT: MAIN CONTENT */}
            <div className="flex-1 space-y-6">

              {/* BOX: team + project */}
              <NameTeamProject task={task} />

              <TaskHeader 
                task={task} 
                onUpdated={(updated) => setTask(updated)}
                onDeleted={handleDeleted}
                currentUserId={currentUser?._id}
              />
            </div>

            {/* RIGHT: SIDEBAR META */}
            <TaskSidebar 
              task={task} 
              onUpdated={loadTask}
              currentUser={currentUser}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
