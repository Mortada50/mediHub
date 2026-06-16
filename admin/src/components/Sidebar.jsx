import React from "react";
import {
  LayoutDashboard,
  Users,
  LogOut,
  PanelRightIcon,
  Stethoscope,
  Pill,
  Syringe,
  ClipboardCheck,
  MessageCircle,
  FileText,
} from "lucide-react";
import { Link, useLocation } from "react-router";
import { useAuth } from "@clerk/clerk-react";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "لوحة التحكم", path: "/dashboard" },
  { icon: Stethoscope, label: "إدارة الأطباء", path: "/doctors-management" },
  { icon: Pill, label: "إدارة الصيدليات", path: "/pharmacy-management" },
  { icon: Syringe, label: "إدارة الأدوية", path: "/medication-management" },
  { icon: FileText, label: "إدارة المقالات", path: "/articles-management" },
  { icon: Users, label: "إدارة المستخدمين", path: "/users-management" },
  {
    icon: ClipboardCheck,
    label: "إدارة الطلبات والتسجيل",
    path: "/admissions-registration",
  },
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
      }}
      className={`fixed right-0 z-40 flex flex-col bg-white border-l border-gray-200 overflow-hidden transition-all duration-300
        ${isOpen ? "w-[230px] translate-x-0" : "w-[80px] max-md:w-[230px] max-md:translate-x-full"}
      `}>
      {/* ── BTN for toggling Sidebar ── */}
      <div
        className={`flex items-center border-b border-gray-200 px-3 h-[56px]
          ${isOpen ? "justify-end" : "max-md:justify-end md:justify-center"}
        `}>
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
      <nav className="flex-1 py-4 flex flex-col gap-1 px-1.5 overflow-y-auto no-scrollbar">
        {NAV_ITEMS.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={label}
              to={path}
              onClick={() => {
                if (window.innerWidth <= 768) onToggle();
              }}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-150
               ${isOpen ? "justify-start" : "max-md:justify-start md:justify-center"}
               ${isActive ? "bg-background-primary text-primary font-normal" : "text-text-secondary hover:bg-background-primary hover:text-primary"}
              `}>
              <Icon className="size-5 shrink-0 " />
              <span
                className={`whitespace-nowrap ${isOpen ? "block" : "max-md:block md:hidden"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* ── Logout ── */}
      <div className="px-1.5 pb-6 mt-auto">
        <button
          onClick={() => signOut()}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-red-500 hover:bg-red-50 transition-colors duration-150 cursor-pointer
            ${isOpen ? "justify-start" : "max-md:justify-start md:justify-center"}
          `}>
          <LogOut className="size-5 shrink-0" />
          <span
            className={`text-sm font-medium whitespace-nowrap ${isOpen ? "block" : "max-md:block md:hidden"}`}>
            تسجيل الخروج
          </span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
