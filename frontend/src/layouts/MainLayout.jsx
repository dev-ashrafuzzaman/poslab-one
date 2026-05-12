import { Outlet } from "react-router-dom";

import Sidebar from "../components/layout/Sidebar";
import TopNav from "../components/layout/TopNav";
import Footer from "../components/layout/Footer";

import { useAuth } from "../context/useAuth";

export default function MainLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      {/* SIDEBAR */}
      <div className="w-64 shrink-0 border-r border-gray-200 bg-white">
        <Sidebar user={user} />
      </div>

      {/* CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav
          user={user}
          logout={logout}
        />

        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}