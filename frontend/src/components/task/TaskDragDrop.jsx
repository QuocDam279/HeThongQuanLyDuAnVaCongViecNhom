import React, { useState } from 'react';

export default function TaskDragDrop({ tasks, onTaskUpdated, TaskItemComponent }) {
  const [draggedTask, setDraggedTask] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const columns = [
    { id: 'To Do', title: 'CHƯA THỰC HIỆN' },
    { id: 'In Progress', title: 'ĐANG THỰC HIỆN' },
    { id: 'Done', title: 'ĐÃ HOÀN THÀNH' }
  ];

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    setDraggedTask(null);
    setIsDragging(false);
    setDragOverColumn(null);
    e.currentTarget.style.opacity = '1';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (columnId) => {
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    
    if (!draggedTask || draggedTask.status === newStatus) {
      setDraggedTask(null);
      setIsDragging(false);
      return;
    }

    try {
      const newProgress = newStatus === 'Done' ? 100 : 
                         newStatus === 'In Progress' ? Math.max(draggedTask.progress || 0, 1) : 0;

      await onTaskUpdated(draggedTask._id, {
        status: newStatus,
        progress: newProgress
      });

    } catch (error) {
      console.error('Lỗi khi cập nhật task:', error);
    } finally {
      setDraggedTask(null);
      setIsDragging(false);
    }
  };

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 p-6">
      <div className="grid grid-cols-3 gap-4">
        {columns.map((column, index) => {
          const columnTasks = getTasksByStatus(column.id);
          const isDropTarget = dragOverColumn === column.id && draggedTask?.status !== column.id;
          
          return (
            <div 
              key={column.id} 
              className="flex flex-col"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-xs font-semibold text-gray-600 tracking-wide">
                  {column.title}
                </h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  {columnTasks.length}
                </span>
              </div>

              {/* Column Content */}
              <div
                onDragOver={handleDragOver}
                onDragEnter={() => handleDragEnter(column.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.id)}
                className={`flex-1 min-h-[600px] rounded-lg transition-all p-2 ${
                  isDropTarget 
                    ? 'bg-blue-50 border-2 border-dashed border-blue-400' 
                    : 'bg-gray-50'
                }`}
              >
                <div className="space-y-3">
                  {columnTasks.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                      {isDropTarget ? 'Thả vào đây' : ''}
                    </div>
                  ) : (
                    columnTasks.map(task => (
                      <div 
                        key={task._id} 
                        draggable
                        onDragStart={(e) => handleDragStart(e, task)}
                        onDragEnd={handleDragEnd}
                        className="cursor-grab active:cursor-grabbing transition-opacity"
                      >
                        <TaskItemComponent 
                          task={task} 
                          onTaskUpdated={onTaskUpdated}
                          hideStatus={true}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}