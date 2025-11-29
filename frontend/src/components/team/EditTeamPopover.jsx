// src/components/team/EditTeamPopover.jsx
import React, { useState, useRef, useEffect } from "react";
import { updateTeam } from "../../services/teamService";

export default function EditTeamPopover({ team, onSaved, onClose }) {
  const [name, setName] = useState(team.team_name);
  const [description, setDescription] = useState(team.description);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const popoverRef = useRef(null);

  // đóng popup khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Tên nhóm không được để trống");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const updated = await updateTeam(team._id, { team_name: name, description });
      onSaved(updated.team);
      onClose();
    } catch (err) {
      setError(err.message || "Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={popoverRef}
      className="absolute top-10 right-0 w-72 bg-white border rounded-xl shadow-lg p-4 z-50"
    >
      <h3 className="font-semibold text-gray-800 mb-3">Sửa nhóm</h3>

      {error && (
        <p className="text-red-500 text-sm mb-2">{error}</p>
      )}

      <label className="text-sm font-medium">Tên nhóm *</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border rounded px-3 py-2 text-sm mb-3 outline-none"
      />

      <label className="text-sm font-medium">Mô tả</label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full border rounded px-3 py-2 text-sm mb-3 outline-none resize-none"
        rows={3}
      />

      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="px-3 py-1.5 text-sm border rounded hover:bg-gray-100"
          disabled={loading}
        >
          Hủy
        </button>
        <button
          onClick={handleSave}
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Đang lưu..." : "Lưu"}
        </button>
      </div>
    </div>
  );
}
