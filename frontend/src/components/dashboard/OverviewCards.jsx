import React, { useEffect, useState } from "react";
import { Users, FolderKanban, ListTodo, AlarmClock } from "lucide-react";

import { getMyTeams } from "../../services/teamService";
import { getMyProjects } from "../../services/projectService";
import { getMyTasks } from "../../services/taskService";

export default function OverviewCards() {
  const [teamCount, setTeamCount] = useState(0);
  const [projectCount, setProjectCount] = useState(0);
  const [taskCount, setTaskCount] = useState(0);
  const [upcomingCount, setUpcomingCount] = useState(0);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [teams, projects, tasks] = await Promise.all([
          getMyTeams(),
          getMyProjects(),
          getMyTasks()
        ]);

        setTeamCount(teams?.length || 0);
        setProjectCount(projects?.length || 0);
        setTaskCount(tasks?.length || 0);

        // 🔥 Sắp đến hạn (deadline 3 ngày gần nhất)
        const now = new Date();
        const limit = new Date();
        limit.setDate(limit.getDate() + 3);

        const upcoming = tasks.filter((t) => {
          if (!t.due_date) return false;
          const date = new Date(t.due_date);
          return (
            date >= now &&
            date <= limit &&
            t.status !== "Đã hoàn thành"
          );
        });

        setUpcomingCount(upcoming.length);
      } catch (err) {
        setTeamCount(0);
        setProjectCount(0);
        setTaskCount(0);
        setUpcomingCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const cards = [
    {
      title: "Nhóm",
      value: loading ? "…" : teamCount,
      icon: <Users size={20} />,
      color: "bg-blue-500",
    },
    {
      title: "Dự án",
      value: loading ? "…" : projectCount,
      icon: <FolderKanban size={20} />,
      color: "bg-green-500",
    },
    {
      title: "Công việc",
      value: loading ? "…" : taskCount,
      icon: <ListTodo size={20} />,
      color: "bg-orange-500",
    },
    {
      title: "Sắp đến hạn",
      value: loading ? "…" : upcomingCount,
      icon: <AlarmClock size={20} />,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div
          key={c.title}
          className="bg-white p-4 rounded-xl shadow flex items-center gap-3 hover:shadow-md transition"
        >
          <div className={`${c.color} text-white p-2 rounded-lg`}>
            {c.icon}
          </div>
          <div>
            <div className="text-lg font-bold text-slate-800">{c.value}</div>
            <div className="text-sm text-slate-500">{c.title}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
