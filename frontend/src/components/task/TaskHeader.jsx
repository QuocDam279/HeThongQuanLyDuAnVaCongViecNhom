import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, Edit, Trash2, Check, X } from "lucide-react";
import { deleteTask } from "../../services/taskService";

export default function TaskHeader({ task, onUpdated, onDeleted, currentUserId }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(task.task_name);
  const [editedDesc, setEditedDesc] = useState(task.description || "");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const canDelete = currentUserId && (
    task.created_by?._id?.toString() === currentUserId.toString() || 
    task.created_by?.toString() === currentUserId.toString()
  );

  useEffect(() => {
    console.log('🔍 Debug canDelete:', {
      currentUserId,
      typeOfCurrentUserId: typeof currentUserId,
      createdBy: task.created_by,
      typeOfCreatedBy: typeof task.created_by,
      createdById: task.created_by?._id,
      canDelete,
      comparison1: task.created_by?._id?.toString() === currentUserId?.toString(),
      comparison2: task.created_by?.toString() === currentUserId?.toString()
    });
  }, [task, currentUserId]);
  // Đóng menu khi click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const handleSave = async () => {
    setError(null);
    try {
      onUpdated({
        ...task,
        task_name: editedName,
        description: editedDesc
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Lỗi cập nhật:", err);
      setError(err.response?.data?.message || "Không thể cập nhật công việc");
    }
  };

  const handleCancel = () => {
    setEditedName(task.task_name);
    setEditedDesc(task.description || "");
    setIsEditing(false);
    setError(null);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      // Gọi API xóa task trên server
      await deleteTask(task._id);
      
      // Sau khi xóa thành công, thông báo cho component cha
      setTimeout(() => {
        onDeleted();
      }, 500);
    } catch (err) {
      console.error("Lỗi xóa task:", err);
      const errorMsg = err.response?.data?.message || err.message || "Không thể xóa công việc";
      setError(errorMsg);
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      <div className="relative">
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <span className="text-red-600 font-medium">⚠️</span>
            <div className="flex-1">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Menu 3 chấm */}
        {!isEditing && canDelete && (
          <div className="absolute top-6 right-6" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Tùy chọn"
            >
              <MoreVertical size={20} />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">

                {/* Chỉnh sửa */}
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors text-gray-700"
                >
                  <Edit size={16} />
                  <span className="font-medium">Chỉnh sửa</span>
                </button>

                {/* Xóa */}
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={() => {
                    setShowDeleteModal(true);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-red-50 transition-colors text-red-600"
                >
                  <Trash2 size={16} />
                  <span className="font-medium">Xóa</span>
                </button>

              </div>
            )}
          </div>
        )}

        {/* Edit Mode */}
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Tên công việc
              </label>
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="w-full text-2xl font-bold border-2 border-blue-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Mô tả
              </label>
              <textarea
                value={editedDesc}
                onChange={(e) => setEditedDesc(e.target.value)}
                rows={6}
                className="w-full border-2 border-blue-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Thêm mô tả chi tiết..."
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Check size={18} />
                Lưu thay đổi
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                <X size={18} />
                Hủy
              </button>
            </div>
          </div>
        ) : (
          // View Mode
          <div className="border-l-4 border-blue-500 pl-5 py-3 bg-blue-50/40 rounded-md mb-4">
            <h1 className="text-xl font-semibold text-blue-700 leading-snug mb-2">
              {task.task_name}
            </h1>

            {task.description ? (
              <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm">
                {task.description}
              </p>
            ) : (
              <p className="text-gray-500 italic text-sm">
                Chưa có mô tả cho công việc này
              </p>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="text-red-600" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Xóa công việc?</h3>
                <p className="text-sm text-gray-500">Hành động này không thể hoàn tác</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 font-medium">{task.task_name}</p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    Xóa
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setError(null);
                }}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}