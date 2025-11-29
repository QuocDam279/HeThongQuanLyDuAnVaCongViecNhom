// TeamInfo.jsx
import React from "react";
import { Users } from "lucide-react";
import TeamActions from "./TeamActions"; // import TeamActions

export default function TeamInfo({ team, members, currentUserRole, onUpdated, onDeleted }) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-white border border-blue-400 p-6 mb-6 transition-transform hover:scale-102 rounded-2xl">
      {/* Header nhóm + actions */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-indigo-600 truncate border-l-4 border-indigo-500 pl-2">
          {team.team_name}
        </h2>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-gray-800 text-sm font-medium">
            <Users size={20} className="text-blue-500" />
            <span>{members?.length || 0} thành viên</span>
          </div>
          
          {/* TeamActions hiển thị nếu là leader */}
          {currentUserRole === "leader" && (
            <TeamActions
              teamId={team._id}
              teamData={team}
              currentUserRole={currentUserRole}
              onUpdated={onUpdated}
              onDeleted={onDeleted}
            />
          )}
        </div>
      </div>

      {/* Mô tả nhóm */}
      <div className="text-gray-600 text-sm leading-relaxed mb-4">
        {team.description || (
          <span className="italic text-gray-400">Chưa có mô tả cho nhóm này.</span>
        )}
      </div>

      {/* Thông tin thêm */}
      <div className="flex gap-4 mt-2 text-gray-500 text-sm">
        {team.created_at && (
          <div className="flex items-center gap-1">
            <span className="font-medium">Ngày tạo:</span> {new Date(team.created_at).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
}
