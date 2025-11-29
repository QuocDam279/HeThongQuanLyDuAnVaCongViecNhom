import React, { useState, useRef, useEffect } from "react";
import { updateProject, deleteProject } from "../../services/projectService";
import { useNavigate } from "react-router-dom";
import { MoreVertical, Edit, Trash2 } from "lucide-react";

export default function ProjectActions({ project }) {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const isCreator = project.created_by?._id === userId;

  const [menuOpen, setMenuOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const [form, setForm] = useState({
    project_name: project.project_name,
    description: project.description,
    start_date: project.start_date?.slice(0, 10),
    end_date: project.end_date?.slice(0, 10),
  });

  const containerRef = useRef(null); // ⭐ Đổi tên
  const popupRef = useRef(null);

  // ========== FIX CLICK OUTSIDE ==========
  useEffect(() => {
    if (!menuOpen && !showPopup) return;

    const handleClick = (e) => {
      // ⭐ Kiểm tra click có nằm trong container không
      if (containerRef.current && containerRef.current.contains(e.target)) {
        return;
      }
      if (popupRef.current && popupRef.current.contains(e.target)) {
        return;
      }

      setMenuOpen(false);
      setShowPopup(false);
    };

    // ⭐ Delay nhỏ để tránh bắt click hiện tại
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClick);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [menuOpen, showPopup]);

  const handleDelete = async () => {
    if (!confirm("Bạn chắc chắn muốn xóa dự án này?")) return;

    try {
      await deleteProject(project._id);
      alert("Xóa dự án thành công!");
      navigate("/duan");
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  const handleUpdate = async () => {
    try {
      await updateProject(project._id, form);
      alert("Cập nhật thành công!");
      window.location.reload(); // ⭐ Reload để cập nhật UI
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
    setShowPopup(false);
  };

  if (!isCreator) return null;

  return (
    <div className="relative" ref={containerRef}> {/* ⭐ Ref ở đây */}
      {/* Nút 3 chấm */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen((prev) => !prev);
        }}
        className="p-2 rounded-full hover:bg-gray-200"
      >
        <MoreVertical size={20} />
      </button>

      {/* Dropdown menu */}
      {menuOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-[50]">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowPopup(true);
              setMenuOpen(false);
            }}
            className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100"
          >
            <Edit size={16} /> Sửa dự án
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(false);
              handleDelete();
            }}
            className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-red-600"
          >
            <Trash2 size={16} /> Xóa dự án
          </button>
        </div>
      )}

      {/* Popup Sửa */}
      {showPopup && (
        <div
          ref={popupRef}
          className="absolute right-0 mt-3 w-80 bg-white border rounded-xl shadow-lg p-4 z-[9999]"
        >
          <h3 className="font-semibold text-gray-700 mb-3">Chỉnh sửa dự án</h3>

          <div className="space-y-3 text-sm">
            <input
              type="text"
              className="border rounded-lg p-2 w-full"
              value={form.project_name}
              onChange={(e) => setForm({ ...form, project_name: e.target.value })}
            />

            <textarea
              rows={2}
              className="border rounded-lg p-2 w-full"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                className="border rounded-lg p-2"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              />

              <input
                type="date"
                className="border rounded-lg p-2"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              />
            </div>

            <button
              onClick={handleUpdate}
              className="w-full mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Lưu thay đổi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}