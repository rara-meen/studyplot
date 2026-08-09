import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";
import MobileBottomNav from "./MobileBottomNav";
import { useAppContext } from "../../context/AppContext";
import { startStudyTimeSession } from "../../utils/studyTimeTracker";

const DashboardLayout = () => {
  const { isSidebarOpen, setIsSidebarOpen } = useAppContext();

  useEffect(() => {
    const stop = startStudyTimeSession();
    return stop;
  }, []);

  return (
    <div className="flex min-h-screen bg-surface dark:bg-night">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-8">
          <Outlet />
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default DashboardLayout;
