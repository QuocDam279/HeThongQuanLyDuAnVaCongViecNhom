// pages/Task.jsx
import React, { useState, useEffect } from "react";
import Menu from "../components/common/Menu";
import Header from "../components/common/Header";
import TaskDragDrop from "../components/task/TaskDragDrop";
import TaskItem from "../components/task/TaskItem";
import { getMyTasks, getTaskStats, updateTask } from "../services/taskService";

export default function Task() {
  const [collapsed, setCollapsed] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null); // ✅ Thêm state stats
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sidebarWidth = collapsed ? "4rem" : "16rem";

  const fetchTasks = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMyTasks();
      setTasks(data);
    } catch (err) {
      setError("Lỗi khi tải công việc");
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await getTaskStats();
      setStats(data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const handleTaskUpdated = async (taskId, payload) => {
    try {
      await updateTask(taskId, payload);
      // Fetch lại cả tasks và stats sau khi update
      await Promise.all([fetchTasks(), fetchStats()]);
    } catch (err) {
      setError("Lỗi khi cập nhật công việc");
      console.error("Error updating task:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen flex">
      <Menu collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className="flex-1">
        <Header collapsed={collapsed} sidebarWidth={sidebarWidth} />

        <div
          className="pt-24 px-6 space-y-8 transition-all duration-300"
          style={{ marginLeft: sidebarWidth }}
        >
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Công việc của tôi
          </h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-gray-500">Đang tải...</div>
            </div>
          ) : (
            <TaskDragDrop 
              tasks={tasks} 
              onTaskUpdated={handleTaskUpdated}
              TaskItemComponent={TaskItem}
            />
          )}
        </div>
      </div>
    </div>
  );
}