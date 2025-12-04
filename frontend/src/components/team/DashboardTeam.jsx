// src/components/team/DashboardTeam.jsx
import React, { useState, useEffect, useMemo } from "react";
import { HeaderTeam } from "./HeaderTeam";
import AddTeamForm from "./AddTeamForm";
import ViewToggle from "./ViewToggle";
import TeamGrid from "./TeamGrid";
import TeamList from "./TeamList";
import { getMyTeams, getLeaderTeams } from "../../services/teamService";

export default function DashboardTeam() {
  const [view, setView] = useState("grid");
  const [showForm, setShowForm] = useState(false);

  const [activeTab, setActiveTab] = useState("all"); // all | mine
  const [teams, setTeams] = useState([]);

  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔹 Bỏ dấu tiếng Việt
  const removeVietnameseTone = (str) =>
    str
      ?.normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase();

  // 🔹 Hàm load team theo loại tab
  const loadTeams = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        activeTab === "all" ? await getMyTeams() : await getLeaderTeams();

      setTeams(data || []);
    } catch (err) {
      setError("Không thể tải danh sách nhóm");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Gọi lại khi đổi tab
  useEffect(() => {
    loadTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // 🔹 Filter team theo tên + mô tả
  const filteredTeams = useMemo(() => {
    const query = removeVietnameseTone(searchValue.trim());

    if (!query) return teams;

    return teams.filter((team) => {
      const name = removeVietnameseTone(team.team_name);
      const desc = removeVietnameseTone(team.description || "");
      return name.includes(query) || desc.includes(query);
    });
  }, [teams, searchValue]);

  return (
    <div className="w-full">
      {/* Header + search */}
      <HeaderTeam
        onCreate={() => setShowForm(true)}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
      />

      {/* Form tạo nhóm */}
      {showForm && (
        <AddTeamForm
          onClose={() => setShowForm(false)}
          onCreated={loadTeams}
        />
      )}

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b pb-2 mb-4 text-gray-600">
        <button
          className={`pb-1 ${
            activeTab === "all"
              ? "text-blue-600 font-medium border-b-2 border-blue-600"
              : "hover:text-black"
          }`}
          onClick={() => setActiveTab("all")}
        >
          Tất cả các nhóm
        </button>

        <button
          className={`pb-1 ${
            activeTab === "mine"
              ? "text-blue-600 font-medium border-b-2 border-blue-600"
              : "hover:text-black"
          }`}
          onClick={() => setActiveTab("mine")}
        >
          Nhóm của bạn
        </button>
      </div>

      {/* Count + view toggle */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-600">{filteredTeams.length} nhóm</p>
        <ViewToggle view={view} setView={setView} />
      </div>

      {/* Render */}
      {loading ? (
        <p className="text-gray-600">Đang tải danh sách nhóm...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : filteredTeams.length === 0 ? (
        <p className="text-gray-500 italic mt-4">
          Không có nhóm nào phù hợp.
        </p>
      ) : view === "grid" ? (
        <TeamGrid teams={filteredTeams} />
      ) : (
        <TeamList teams={filteredTeams} />
      )}
    </div>
  );
}
