import React, { useState, useRef, useEffect } from "react";
import { deleteTeam } from "../../services/teamService";
import EditTeamPopover from "./EditTeamPopover";
import { MoreVertical, Edit, Trash2 } from "lucide-react";

export default function TeamActions({
  teamId,
  teamData,
  currentUserRole,
  onUpdated,
  onDeleted
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [error, setError] = useState("");

  const menuRef = useRef(null);

  if (currentUserRole !== "leader") return null;

  // Xóa nhóm
  const handleDelete = async () => {
    if (!window.confirm("Bạn có chắc muốn xóa nhóm này?")) return;

    setLoadingDelete(true);
    setError("");

    try {
      await deleteTeam(teamId);
      onDeleted();
    } catch (err) {
      setError(err.message || "Xóa nhóm thất bại");
    } finally {
      setLoadingDelete(false);
      setMenuOpen(false);
    }
  };

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={menuRef}>
      {/* Nút 3 chấm */}
      <button
        className="p-2 rounded-full hover:bg-gray-100 transition"
        onClick={() => setMenuOpen(!menuOpen)}
        title="Tùy chọn"
      >
        <MoreVertical size={20} />
      </button>

      {/* Menu */}
      {menuOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <button
            onClick={() => {
              setShowEdit(true);
              setMenuOpen(false);
            }}
            className="flex items-center gap-2 w-full px-4 py-2 hover:bg-blue-50 text-gray-800"
          >
            <Edit size={16} /> Sửa nhóm
          </button>

          <button
            onClick={handleDelete}
            disabled={loadingDelete}
            className="flex items-center gap-2 w-full px-4 py-2 hover:bg-red-50 text-red-600 disabled:opacity-50"
          >
            <Trash2 size={16} /> {loadingDelete ? "Đang xóa..." : "Xóa nhóm"}
          </button>
        </div>
      )}

      {/* Popup nhỏ sửa nhóm */}
      {showEdit && (
        <EditTeamPopover
          team={teamData}
          onSaved={(updated) => {
            onUpdated(updated);
            setShowEdit(false);
          }}
          onClose={() => setShowEdit(false)}
        />
      )}

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
