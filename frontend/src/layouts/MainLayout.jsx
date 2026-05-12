import React, { useCallback, useEffect, useMemo, useState } from "react";
import TopNav from "../components/layout/TopNav";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";
import { useAuth } from "../context/useAuth";
import { useLocation } from "react-router-dom";

export default function MainLayout({ children }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const isPosScreen = useMemo(
    () => location.pathname.startsWith("/pos"),
    [location.pathname]
  );

  const toggleDrawer = useCallback(
    () => setIsDrawerOpen((p) => !p),
    []
  );

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  useEffect(() => {
    closeDrawer();
  }, [location.pathname, closeDrawer]);

  return (
    // 🔥 FIX 1: h-screen instead of min-h-screen
    <div className="h-screen flex bg-gray-50 relative overflow-hidden">
      {/* ---------------- Sidebar ---------------- */}
      {!isPosScreen && (
        <div className="bg-white border-r border-gray-200 w-64 shrink-0">
          <Sidebar isDrawerOpen closeDrawer={closeDrawer} user={user} />
        </div>
      )}

      {/* POS Drawer */}
      {isPosScreen && isDrawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={closeDrawer}
          />
          <div className="fixed left-0 top-0 h-full w-64 bg-white z-50 shadow-xl">
            <Sidebar isDrawerOpen closeDrawer={closeDrawer} user={user} />
          </div>
        </>
      )}

      {/* ---------------- Main Content ---------------- */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TopNav should NOT scroll */}
        <TopNav
          user={user}
          logout={logout}
          toggleDrawer={toggleDrawer}
          isDrawerOpen={isDrawerOpen}
          isPosScreen={isPosScreen}
        />

        {/* 🔥 FIX 2: THIS is the ONLY scroll container */}
        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>

        {/* Footer should NOT scroll */}
        {!isPosScreen && <Footer />}
      </div>
    </div>
  );
}
