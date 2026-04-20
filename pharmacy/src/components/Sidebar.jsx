import React from "react";
import {
  LayoutDashboard,
  LogOut,
  PanelRightIcon,
  MessageCircle,
  FileText,
} from "lucide-react";
import { Link, useLocation } from "react-router";
import { useAuth } from "@clerk/clerk-react";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "لوحة التحكم", path: "/dashboard" },
  { icon: MessageCircle, label: "الرسائل", path: "/chats" },
];

export const SIDEBAR_OPEN_WIDTH = 230;
export const SIDEBAR_CLOSED_WIDTH = 80;

function Sidebar({ isOpen, onToggle, navbarHeight = "81px" }) {
  const { isSignedIn, isLoaded, signOut } = useAuth();

  const location = useLocation();

  return (
    <aside
      style={{
        top: navbarHeight,
        height: `calc(100vh - ${navbarHeight})`,
        width: isOpen ? `${SIDEBAR_OPEN_WIDTH}px` : `${SIDEBAR_CLOSED_WIDTH}px`,
        transition: "width 300ms ease-in-out",
      }}
      className="fixed right-0 z-40 flex flex-col bg-white border-l border-gray-200 overflow-hidden">
      {/* ── BTN for toggling Sidebar ── */}
      <div
        className="flex items-center border-b border-gray-200 px-3"
        style={{
          height: "56px",
          justifyContent: isOpen ? "flex-end" : "center",
        }}>
        <button
          onClick={onToggle}
          aria-label={
            isOpen ? "إغلاق القائمة الجانبية" : "فتح القائمة الجانبية"
          }
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
          <PanelRightIcon
            className="size-5 text-primary"
            style={{
              transform: isOpen ? "rotate(0deg)" : "rotate(180deg)",
              transition: "transform 300ms ease-in-out",
            }}
          />
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 py-4 flex flex-col gap-1 px-1.5">
        {NAV_ITEMS.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={label}
              to={path}
              style={{ justifyContent: isOpen ? "flex-start" : "center" }}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-gray-600  hover:bg-background-primary hover:text-primary transition-colors duration-150
               ${
                 isActive
                   ? "bg-background-primary text-primary font-normal "
                   : "text-text-secondary"
               }`}>
              <Icon className="size-5 shrink-0 " />
              {isOpen && <span className="whitespace-nowrap">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* ── Logout ── */}
      <div className="px-1.5 pb-6">
        <button
          onClick={() => signOut()}
          style={{ justifyContent: isOpen ? "flex-start" : "center" }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-red-500 hover:bg-red-50 transition-colors duration-150 cursor-pointer">
          <LogOut className="size-5 shrink-0" />
          {isOpen && (
            <span className="text-sm font-medium whitespace-nowrap">
              تسجيل الخروج
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
