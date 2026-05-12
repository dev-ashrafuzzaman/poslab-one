import { useState, useCallback, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import TopNav from "./TopNav";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { useAuth } from "../../context/useAuth";

const Layout = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation(); 
  
  // Stable handlers to prevent unnecessary re-renders
  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen((prev) => !prev);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  // Close sidebar automatically on route change
  useEffect(() => {
    closeDrawer();
  }, [location.pathname, closeDrawer]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
    

      {/* Main content area */}
      <div className="flex flex-1 flex-col md:ml-64">
        {/* Top Navigation */}
        <header className="sticky top-0 z-50 bg-white shadow-sm">
          <TopNav
            toggleDrawer={toggleDrawer}
            isDrawerOpen={isDrawerOpen}
            user={user}
            logout={logout}
          />
        </header>
          <Sidebar isDrawerOpen={isDrawerOpen} closeDrawer={closeDrawer}  user={user}/>

        {/* Main content */}
        <main className="flex-1 p-4 overflow-y-auto">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t bg-white shadow-inner">
          <Footer />
        </footer>
      </div>
    </div>
  );
};

export default Layout;
