import { useState } from "react";
import Sidebar from "./Sidebar";
import RightSidebar from "./RightSidebar";
import TopSection from "./TopSection";
import { Outlet } from "react-router-dom";
import { useConfig } from "../../context/ConfigContext";
import { useAuth } from "../../context/AuthContext";

export default function AppLayout() {
    const { config } = useConfig();
  const { user, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    if (loading || (user && !config)) {
    return <div>Loading application...</div>;
  }

  return (
    <div className="min-h-screen lg:h-screen flex flex-col lg:flex-row bg-gray-100">

      {/* MOBILE + TABLET SIDEBAR OVERLAY */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR (Drawer for Mobile + Tablet) */}
      <div
        className={`
          fixed lg:static top-0 left-0 h-full lg:h-auto
          w-64 bg-white z-50 transform transition-transform duration-300
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:flex-shrink-0
        `}
      >
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* MAIN SECTION */}
      <div className="flex-1 flex flex-col">

        {/* TOP HEADER */}
        <div className="flex-shrink-0 bg-white shadow-sm">
          <TopSection onMenuClick={() => setIsSidebarOpen(true)} />
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 lg:p-6 py-4">

          {/* MAIN OUTLET */}
          <Outlet />

          {/* TABLET + MOBILE EVENTS & CALENDAR */}
          <div className="block lg:hidden mt-10 md:mt-12">
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-800">
                Events & Calendar
              </h2>
              <RightSidebar />
            </div>
          </div>

        </div>

      </div>

      {/* DESKTOP RIGHT SIDEBAR */}
      <div className="hidden lg:block w-80 flex-shrink-0 border-l bg-white">
        <RightSidebar />
      </div>

    </div>
  );
}