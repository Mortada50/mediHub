import React from "react";
import { Bell } from "lucide-react";

import logo from "../assets/logo.png";
import profile from "../assets/doc1.png";

import { useUser } from "@clerk/clerk-react";

function Navbar() {

  const { user } = useUser();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-[81px] items-center justify-between bg-white border-b border-gray-200">
      {/* Logo */}
      <img
        src={logo}
        alt="Logo"
        className="w-36 h-[66px] object-contain mr-12.5"
      />

      {/* Actions */}
      <div className="flex items-center gap-4 ml-12.5">
        <img
          src={user?.publicMetadata?.avatar || profile}
          alt="Profile"
          className="size-9 object-cover rounded-full border border-primary"
        />
        <button
          aria-label="الإشعارات"
          className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
          <Bell className="size-[22px] text-primary" />
        </button>
      </div>
    </header>
  );
}

export default Navbar;
