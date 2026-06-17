import React, { useEffect, useState } from "react";
import { useClerk, useUser } from "@clerk/clerk-react";
import { Outlet, Navigate } from "react-router";

import Navbar from "../components/Navbar";
import Sidebar, {
  SIDEBAR_OPEN_WIDTH,
  SIDEBAR_CLOSED_WIDTH,
} from "../components/Sidebar";
import PageLoader from "../components/PageLoader";

const NAVBAR_HEIGHT = "81px";

function DashboardLayout() {
  // فتح القائمة في الكمبيوتر وإغلاقها افتراضياً في الموبايل
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

  const { signOut } = useClerk();
  const { user, isLoaded } = useUser();

  // مراقبة حجم الشاشة لضبط القائمة تلقائياً
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isLoaded || !user) return;

    const checkRole = async () => {
      const role = user?.publicMetadata?.role;
      if (role !== "pharmacy") {
        await signOut({ redirectUrl: "/login" });
      }
    };

    checkRole();
  }, [isLoaded, user, signOut]);

  if (!isLoaded) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;

  return (
    user?.publicMetadata?.role === "pharmacy" && (
      <div className="min-h-screen">
        {/* تمرير أمر فتح القائمة لشريط التنقل العلوي */}
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />

        <div
          style={{ paddingTop: NAVBAR_HEIGHT }}
          className="flex min-h-screen">
          <main
            className={`p-4 md:p-6 md:pt-3 pr-3 transition-all duration-300 w-full
              ${isSidebarOpen ? "md:mr-[230px]" : "md:mr-[80px]"} mr-0
            `}>
            <Outlet context={{ isSidebarOpen }} />
          </main>

          {/* خلفية معتمة تظهر في الموبايل فقط، وتغلق القائمة عند الضغط عليها */}
          {isSidebarOpen && (
            <div
              className="md:hidden fixed inset-0 bg-black/40 z-30 backdrop-blur-sm"
              style={{ top: NAVBAR_HEIGHT }}
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          <Sidebar
            isOpen={isSidebarOpen}
            onToggle={() => setIsSidebarOpen((prev) => !prev)}
            navbarHeight={NAVBAR_HEIGHT}
          />
        </div>
      </div>
    )
  );
}

export default DashboardLayout;
