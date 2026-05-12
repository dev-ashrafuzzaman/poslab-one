// src/components/layout/SidebarItem.jsx
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";

export default function SidebarItem({
  item,
  openMenu,
  setOpenMenu,
  closeDrawer,
}) {
  const location = useLocation();
  const Icon = item.icon;

  const isActive =
    location.pathname === item.to ||
    item.submenu?.some((sub) =>
      location.pathname.startsWith(sub.to)
    );

  const isOpen = openMenu === item.title;

  const handleClick = () => {
    if (item.submenu) {
      setOpenMenu(isOpen ? null : item.title);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition
        ${
          isActive
            ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
            : "text-gray-600 hover:bg-gray-50"
        }`}
      >
        <span className="flex items-center gap-3">
          <Icon className="w-5 h-5" />
          {item.to ? (
            <Link to={item.to} onClick={closeDrawer}>
              {item.title}
            </Link>
          ) : (
            <span>{item.title}</span>
          )}
        </span>

        {item.submenu &&
          (isOpen ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          ))}
      </button>

      {item.submenu && isOpen && (
        <div className="ml-10 mt-1 space-y-1">
          {item.submenu.map((sub) => (
            <Link
              key={sub.title}
              to={sub.to}
              onClick={closeDrawer}
              className={`block px-3 py-1.5 rounded-md text-sm transition
              ${
                location.pathname === sub.to
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              {sub.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
