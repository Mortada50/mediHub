import React, { useState } from "react";
import { Outlet } from "react-router";

import Navbar from "../components/Navbar";
import Sidebar, { SIDEBAR_OPEN_WIDTH, SIDEBAR_CLOSED_WIDTH } from "../components/Sidebar";

const NAVBAR_HEIGHT = "81px";

function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen">
      <Navbar />

      <div style={{ paddingTop: NAVBAR_HEIGHT }} className="flex min-h-screen">
        <main
          style={{
            marginRight: isSidebarOpen
              ? `${SIDEBAR_OPEN_WIDTH}px`
              : `${SIDEBAR_CLOSED_WIDTH}px`,
            transition: "margin-right 300ms ease-in-out",
            width: "100%",
          }}
          className="p-6">
          <Outlet />
        </main>

        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen((prev) => !prev)}
          navbarHeight={NAVBAR_HEIGHT}
        />
      </div>
    </div>
  );
}

export default DashboardLayout;
