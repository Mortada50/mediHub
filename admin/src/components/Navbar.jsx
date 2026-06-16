import React from "react";
import { Bell, Menu } from "lucide-react";

import logo from "../assets/logo.png";
import profile from "../assets/doc1.png";

import { useUser } from "@clerk/clerk-react";

function Navbar({ onMenuClick }) {
  const { user } = useUser();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex h-[81px] items-center justify-between bg-white border-b border-gray-200 px-4 md:px-12">
      {/* Logo & Mobile Menu Button */}
      <div className="flex items-center gap-3">
        {/* زر فتح القائمة الجانبية (يظهر فقط في الموبايل) */}
        <button
          onClick={onMenuClick}
          className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-primary transition-colors">
          <Menu className="size-6" />
        </button>

        <img
          src={logo}
          alt="Logo"
          className="w-28 md:w-36 h-[50px] md:h-[66px] object-contain"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 md:gap-4">
        <img
          src={user?.publicMetadata?.avatar || profile}
          alt="Profile"
          className="size-8 md:size-9 object-cover rounded-full border border-primary"
        />
        <button
          aria-label="الإشعارات"
          className="flex h-9 w-9 md:h-[38px] md:w-[38px] items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
          <Bell className="size-[20px] md:size-[22px] text-primary" />
        </button>
      </div>
    </header>
  );
}

export default Navbar;
