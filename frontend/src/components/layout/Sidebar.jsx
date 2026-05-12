import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  MessageCircle,
  Youtube,
  Linkedin,
  PhoneCall,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { SIDEBAR_MENU } from "../../config/sidebar.config";
import SidebarItem from "./SidebarItem";
import { NavLink } from "react-router-dom";
import  logo from "../../assets/logo transparent.png"
export default function Sidebar({ isDrawerOpen, closeDrawer, user }) {
  const [openMenu, setOpenMenu] = useState(null);
  const sidebarRef = useRef(null);
  const roleName = user?.roleName;
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        closeDrawer();
      }
    };

    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.body.style.overflow = "auto";
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDrawerOpen, closeDrawer]);


  const filterMenuByRole = (menu, roleName) =>
  menu
    .filter(section => !section.roles || section.roles.includes(roleName))
    .map(section => ({
      ...section,
      items: section.items
        .filter(item => !item.roles || item.roles.includes(roleName))
        .map(item => ({
          ...item,
          submenu: item.submenu
            ? item.submenu.filter(
                sub => !sub.roles || sub.roles.includes(roleName)
              )
            : undefined,
        }))
        .filter(item => !item.submenu || item.submenu.length > 0),
    }))
    .filter(section => section.items.length > 0);

const filteredMenu = useMemo(
  () => filterMenuByRole(SIDEBAR_MENU, roleName),
  [roleName]
);
  return (
    <>
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={closeDrawer}
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed md:static top-0 left-0 h-screen bg-white border-r border-gray-200 flex flex-col shadow-md-r z-50 w-64
        transform transition-all duration-300 ease-in-out
        ${
          isDrawerOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}>
        {/* Header */}
        <div className="flex items-center gap-3 p-4">
          <div
            className={`
            p-2 rounded-xl
          `}>
            <Sparkles className="w-6 h-6 text-blue-500" />
            {/* <img src={logo}  alt="" /> */}
          </div>
          <div>
            <p className="font-bold text-lg bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              POS LAB PRO
            </p>
            <p className="text-xs opacity-60">Business Management</p>
          </div>
        </div>

        <div className="px-4 py-2">
       <NavLink >
           <div className="flex items-center justify-center border border-blue-100 bg-blue-50 text-blue-600 cursor-pointer rounded-md py-2 text-sm font-medium">
            <ShoppingBag className="w-4 h-4 mr-2" />
            CREATE POS SALES
          </div>
       </NavLink>
        </div>

        <div className="flex-1 overflow-y-auto px-1 custom-scroll">
          {filteredMenu.map((section) => (
            <div key={section.header}>
              <p className="px-3 mt-3 mb-2 text-xs text-gray-400 uppercase">
                {section.header}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <SidebarItem
                    key={item.title}
                    item={item}
                    openMenu={openMenu}
                    setOpenMenu={setOpenMenu}
                    closeDrawer={closeDrawer}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Support */}
        <div className="m-4 p-3 border border-dashed border-green-400 rounded-lg bg-green-50/30">
          <p className="text-sm font-medium text-gray-800 text-center">
            Having any problem?
          </p>

          <div className="flex items-center justify-center gap-2 mt-3">
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={`https://wa.me/${"+8801728664312".replace(
                /\D/g,
                "",
              )}?text=${encodeURIComponent(`Hello Richwear Support 👋  
I'm contacting from the Richwear Inventory Pro software (sidebar → Contact Support).  
I need some help regarding the Report section. Could you please assist me with this?`)}`}
              title="Send WhatsApp Message"
              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700
                text-white text-xs px-3 py-1.5 rounded-md">
              <MessageCircle className="w-4 h-4" />
              Report
            </a>
            <button className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded-md">
              <Youtube className="w-4 h-4" />
              Tutorials
            </button>
          </div>

          <div className="border-t border-gray-200 my-3"></div>
          <p className="text-xs text-center text-gray-500 mb-2">
            For Instant Support
          </p>

          <div className="flex items-center justify-center gap-3">
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={`https://wa.me/${"+8801728664312".replace(
                /\D/g,
                "",
              )}?text=${encodeURIComponent(`Hello Richwear Support 👋  
I'm contacting from the *Richwear Inventory Pro* software (sidebar → Contact Support).  
I need some assistance regarding my account setup. Could you please help me?`)}`}
              className="bg-[#00B2FF]/10 text-[#00B2FF] p-2 rounded-full"
              title="Send WhatsApp Message">
              <MessageCircle className="w-4 h-4" />
            </a>
            <a
              href="tel:+8801728664312"
              className="bg-green-100 text-green-600 p-2 rounded-full"
              title="Call Now">
              <PhoneCall className="w-4 h-4" />
            </a>
            <a
              target="_blank"
              href="https://www.linkedin.com/company/richwear/"
              className="bg-blue-100 text-blue-600 p-2 rounded-full">
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}
