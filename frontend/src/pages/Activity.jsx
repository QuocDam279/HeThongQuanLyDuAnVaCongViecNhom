import React, { useState } from "react";
import Menu from "../components/common/Menu";
import Header from "../components/common/Header";
import UserActivities from "../components/activity/UserActivities";

export default function Team() {
  const [collapsed, setCollapsed] = useState(false);

  const sidebarWidth = collapsed ? "4rem" : "16rem";

  return (
    <div className="bg-white min-h-screen flex">
      {/* Menu */}
      <Menu collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main content */}
      <div className="flex-1">
        {/* Header */}
        <Header collapsed={collapsed} sidebarWidth={sidebarWidth} />
        {/* Content */}
        <div
          className="pt-24 px-6 space-y-8 transition-all duration-300"
          style={{ marginLeft: sidebarWidth }}
        >
          <UserActivities />
          </div>
      </div>

    </div>
  );
}
