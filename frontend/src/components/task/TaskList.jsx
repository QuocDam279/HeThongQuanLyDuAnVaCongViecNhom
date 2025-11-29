import React, { useState, useMemo } from "react";
import TaskItem from "./TaskItem";

export default function TaskList({ tasks, onTaskUpdated }) {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // To Do, In Progress, Done
  const [priorityFilter, setPriorityFilter] = useState(""); // Low, Medium, High

  // Lọc tasks dựa trên tìm kiếm và filter
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.task_name.toLowerCase().includes(searchText.toLowerCase()) ||
        (task.description &&
          task.description.toLowerCase().includes(searchText.toLowerCase()));

      const matchesStatus = statusFilter
        ? task.status === statusFilter
        : true;

      const matchesPriority = priorityFilter
        ? task.priority === priorityFilter
        : true;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, searchText, statusFilter, priorityFilter]);

  return (
    <div>
      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4 items-center">
        <input
          type="text"
          placeholder="Tìm kiếm công việc..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1 w-full sm:w-64"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="To Do">Chưa thực hiện</option>
          <option value="In Progress">Đang thực hiện</option>
          <option value="Done">Đã hoàn thành</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1"
        >
          <option value="">Tất cả mức độ</option>
          <option value="Low">Thấp</option>
          <option value="Medium">Trung bình</option>
          <option value="High">Cao</option>
        </select>
      </div>

      {/* Task list */}
      {filteredTasks.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-6">
          Không có công việc nào.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {filteredTasks.map((task) => (
            <TaskItem key={task._id} task={task} onTaskUpdated={onTaskUpdated} />
          ))}
        </div>
      )}
    </div>
  );
}
