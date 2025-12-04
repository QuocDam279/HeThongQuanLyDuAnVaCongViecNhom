// Menu.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  ListChecks,
  History,
  Menu as MenuIcon,
  Clock,
} from "lucide-react";

export default function Menu({ collapsed, setCollapsed }) {
  const menuItems = [
    { name: "Tổng quan", icon: <LayoutDashboard size={18} />, path: "/tongquan" },
    { name: "Nhóm dự án", icon: <Users size={18} />, path: "/nhom" },
    { name: "Dự án", icon: <FolderKanban size={18} />, path: "/duan" },
    { name: "Công việc", icon: <ListChecks size={18} />, path: "/congviec" },
    { name: "Nhật ký hoạt động", icon: <History size={18} />, path: "/nhatkyhoatdong" },
  ];

  const sampleUpcomingTasks = [
    "Thiết kế UI dashboard",
    "Chuẩn bị báo cáo sprint",
    "Cập nhật tài liệu API"
  ];

  return (
    <aside
      className={`
        fixed top-0 left-0 h-screen bg-white text-slate-800 flex flex-col justify-between
        transition-all duration-300 shadow-md border-r border-slate-200
        ${collapsed ? "w-16" : "w-64"}
      `}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow">
        {!collapsed && <span className="text-lg font-bold tracking-wide">QuestDo</span>}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-white/20 transition"
        >
          <MenuIcon size={20} />
        </button>
      </div>

      {/* Content */}
      <nav className="flex-1 flex flex-col gap-2 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50">

        {/* Menu items */}
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            title={collapsed ? item.name : ""}
            className={({ isActive }) =>
              `
              group flex items-center gap-3 px-3 py-2 rounded-xl transition-all
              border border-transparent
              ${
                isActive
                  ? "bg-blue-50 text-blue-600 font-medium border-blue-200 shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-800 hover:shadow-sm"
              }
            `
            }
          >
            <div className="transition-transform duration-200 group-hover:scale-110">
              {item.icon}
            </div>
            {!collapsed && <span>{item.name}</span>}
          </NavLink>
        ))}

        {/* -- Upcoming Tasks Section -- */}
        {!collapsed && (
          <>
            <div className="relative mt-5 mb-3">
              <div className="border-t border-slate-200"></div>

              <span className="
                absolute left-1/2 -translate-x-1/2 -top-[10px]
                bg-white px-3 py-[1px]
                text-[11px] font-semibold text-slate-500
                tracking-wide rounded-full shadow-sm
              ">
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  Sắp đến hạn
                </div>
              </span>
            </div>

            <div className="px-2 space-y-2">
              {sampleUpcomingTasks.map((task, i) => (
                <div
                  key={i}
                  className="
                    text-xs text-slate-700 bg-slate-50 px-3 py-2 rounded-lg
                    border border-slate-200 shadow-sm
                    hover:bg-slate-100 hover:shadow
                    transition cursor-default
                  "
                >
                  {task}
                </div>
              ))}
            </div>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 text-xs text-slate-400 flex items-center justify-center gap-2">
        <span className="w-5 h-[1px] bg-slate-300"></span>
        {!collapsed && "© 2025 QuestDo"}
        <span className="w-5 h-[1px] bg-slate-300"></span>
      </div>
    </aside>
  );
}
