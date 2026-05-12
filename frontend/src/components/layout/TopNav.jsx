import React, { useState, useRef, useEffect } from "react";
import {
  LogOut,
  Menu,
  User,
  Settings,
  Plus,
  ShoppingCart,
  PackagePlus,
  ArrowLeftRight,
  AlertTriangle,
  FilePlus,
  DollarSign,
  ChevronDown,
  Bell,
  Search,
  HelpCircle,
  Grid,
} from "lucide-react";
import { Link } from "react-router-dom";
import getTimeGreetingInfo from "../../utils/getTimeGreetingInfo";
import Button from "../ui/Button";
import profileImg from "../../assets/profile.jpg";

export default function TopNav({
  user,
  logout,
  toggleDrawer,
  isDrawerOpen,
  isPosScreen,
}) {
  const { greeting, icon } = getTimeGreetingInfo();
  const [showProfile, setShowProfile] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const profileRef = useRef(null);
  const quickActionsRef = useRef(null);
  const roleName = user?.roleName;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
      if (
        quickActionsRef.current &&
        !quickActionsRef.current.contains(e.target)
      ) {
        setShowQuickActions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

const quickActions = [
  {
    icon: <Plus className="w-4 h-4" />,
    label: "Sale Return",
    path: "/sales",
    color: "bg-blue-500",
    roles: ["Manager", "Cashier"], 
  },
  {
    icon: <PackagePlus className="w-4 h-4" />,
    label: "New Purchase",
    path: "/purchases/create",
    color: "bg-emerald-500",
    roles: ["Admin", "Super Admin"],
  },
  {
    icon: <FilePlus className="w-4 h-4" />,
    label: "Add Product",
    path: "/products",
    color: "bg-purple-500",
    roles: ["Admin", "Super Admin"],
  },
  {
    icon: <ArrowLeftRight className="w-4 h-4" />,
    label: "Stock Transfer",
    path: "/inventory/stock-transfer",
    color: "bg-amber-500",
    roles: ["Admin", "Super Admin"],
  },
];

const filteredQuickActions = quickActions.filter(action =>
  action.roles.includes(roleName)
);

  return (
    <header className="w-full sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm px-6 py-4 flex items-center justify-between">
      {/* LEFT */}
      <div className="flex items-center gap-6">
        {isPosScreen && (
          <button
            onClick={toggleDrawer}
            className="mr-3 p-2 rounded-md hover:bg-gray-100">
            ☰
          </button>
        )}
        <button
          onClick={toggleDrawer}
          className="p-2 rounded-xl hover:bg-gray-100 lg:hidden">
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden md:flex items-center gap-3">
          <div className="p-2 rounded-lg bg-linear-to-br from-amber-50 to-orange-50">
            <div className="text-xl">{icon}</div>
          </div>
          <div>
            <p className="font-semibold text-sm">{greeting},</p>
            <p className="text-xs text-gray-500">{user?.roleName || "Staff"}</p>
          </div>
        </div>

        {user?.branchName && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-medium">{user.branchName}</span>
          </div>
        )}
      </div>

      {/* SEARCH */}
      <div className="hidden lg:flex flex-1 max-w-xl mx-8">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            placeholder="Search products, orders, customers..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 rounded text-xs border bg-gray-100 text-gray-600">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">
        <button className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-100">
          <HelpCircle className="w-4 h-4" /> Help
        </button>

        <button className="relative p-2 rounded-xl hover:bg-gray-100">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
        </button>

        {/* QUICK ACTIONS */}
        <div className="relative" ref={quickActionsRef}>
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="hidden lg:flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-linear-to-r from-blue-500 to-indigo-500 text-white shadow-md">
            <Grid className="w-4 h-4" />
            Quick Actions
            <ChevronDown
              className={`w-4 h-4 transition ${showQuickActions && "rotate-180"}`}
            />
          </button>

          {showQuickActions && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-2xl shadow-xl">
              <div className="p-4 border-b">
                <p className="font-semibold text-sm">Quick Actions</p>
                <p className="text-xs text-gray-500">Common workflows</p>
              </div>
              <div className="p-2">
                {filteredQuickActions.map((a, i) => (
                  <Link
                    key={i}
                    to={a.path}
                    onClick={() => setShowQuickActions(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50">
                    <div className={`${a.color} p-2 rounded-lg text-white`}>
                      {a.icon}
                    </div>
                    <span className="text-sm font-medium">{a.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* POS */}
        <Link to="/pos">
          <Button className="gap-2 px-4 py-2.5 rounded-xl bg-linear-to-r from-emerald-500 to-green-500 text-white shadow-md">
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Quick POS</span>
          </Button>
        </Link>

        {/* LOW STOCK */}
        <Link
          to="/inventory/low-stock"
          className="p-2 rounded-xl hover:bg-amber-50">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
        </Link>

        {/* PROFILE */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 p-1 rounded-2xl hover:bg-gray-100">
            <img src={profileImg} className="w-9 h-9 rounded-full shadow" />
            <ChevronDown
              className={`w-4 h-4 transition ${showProfile && "rotate-180"}`}
            />
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-3 w-72 bg-white border border-gray-200 rounded-2xl shadow-xl">
              <div className="p-4 border-b">
                <p className="font-semibold">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>

              <div className="p-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50">
                  <User className="w-4 h-4 text-blue-500" /> My Profile
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50">
                  <Settings className="w-4 h-4" /> Settings
                </Link>
                <button
                  onClick={logout}
                  className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-red-600 bg-red-50 hover:bg-red-100">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
