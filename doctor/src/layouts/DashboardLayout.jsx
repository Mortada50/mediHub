import React, { useEffect, useState } from "react";
import { useClerk, useUser } from "@clerk/clerk-react";
import { Outlet } from "react-router";

import Navbar from "../components/Navbar";
import Sidebar, {
  SIDEBAR_OPEN_WIDTH,
  SIDEBAR_CLOSED_WIDTH,
} from "../components/Sidebar";
import PageLoader from "../components/PageLoader";

const NAVBAR_HEIGHT = "81px";

function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const {signOut} = useClerk()
  
     
     const { user, isLoaded } = useUser();
     
     useEffect(() => {
       if (!isLoaded || !user) return;

       const checkRole = async () => {
         const role = user?.publicMetadata?.role;

         if (role !== "doctor") {
           await signOut({ redirectUrl: "/login" });
         }
       };

       checkRole();
     }, [isLoaded, user, signOut]);

      

     if (!isLoaded) return <PageLoader />;
     
     if (!user) return <Navigate to="/login" replace />;
     
  return (
    user?.publicMetadata?.role === "doctor" && (
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
  ));
}

export default DashboardLayout;
