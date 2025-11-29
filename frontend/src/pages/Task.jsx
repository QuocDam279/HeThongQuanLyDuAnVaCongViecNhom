// pages/Task.jsx
import React, { useState, useEffect } from "react";
import Menu from "../components/common/Menu";
import Header from "../components/common/Header";
import TaskStats from "../components/task/TaskStats";
import TaskDragDrop from "../components/task/TaskDragDrop";
import TaskItem from "../components/task/TaskItem"; // Import TaskItem có sẵn
import { getMyTasks, getTaskStats, updateTask } from "../services/taskService";

export default function Task() {
  const [collapsed, setCollapsed] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState([]);
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
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await getTaskStats();
      setStats(data);
    } catch {}
  };

  const handleTaskUpdated = async (taskId, payload) => {
    try {
      await updateTask(taskId, payload);
      await fetchTasks();
      await fetchStats();
    } catch (err) {
      setError("Lỗi khi cập nhật công việc");
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
          <h1 className="text-3xl font-bold mb-2">Công việc của tôi</h1>

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
              TaskItemComponent={TaskItem} // Truyền TaskItem component
            />
          )}
        </div>
      </div>
    </div>
  );
}