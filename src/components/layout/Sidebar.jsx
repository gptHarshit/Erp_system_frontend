import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import companyLogo from "../../assets/Asset_1.png";
import { useAuth } from "../../context/AuthContext";
import { useConfig } from "../../context/ConfigContext";

import {
  FaHome,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaBook,
  FaMoneyBill,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

const Sidebar = ({ onClose }) => {
  const { logout, user } = useAuth(); 
  const { config } = useConfig();

  const navigate = useNavigate();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(null);

  if (!user || !config) {
    return <div>Loading sidebar...</div>;
  }

  const role = user?.role?.toUpperCase();
  const roleConfig = config?.SIDEBAR?.[role];

  if (!roleConfig) {
    return <div>No config for role</div>;
  }

  if (!roleConfig) return null;

  const isActive = (path) => location.pathname === path;

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const menuClass = (path) =>
    `px-3 py-2 rounded-md cursor-pointer transition text-sm ${
      isActive(path)
        ? "bg-blue-100 text-primary font-medium"
        : "text-gray-700 hover:bg-blue-50 hover:text-primary"
    }`;

  const menuItems = [
    {
      key: "EMPLOYEE",
      label: "Employee",
      icon: <FaChalkboardTeacher />,
      children: [
        { key: "ADD_EMPLOYEE", label: "Add Employee", path: "/employees/add-teacher" },
        { key: "MANAGE_EMPLOYEE", label: "Manage Employee", path: "/employees/manage" },
      ],
    },
    {
      key: "STUDENT",
      label: "Student",
      icon: <FaUserGraduate />,
      children: [
        { key: "ENROLLMENT", label: "Enrollment", path: "/student/enrollment" },
        {
          key: "ENROLLMENT_UPDATE",
          label: "Enrollment Update",
          path: "/student/enrollment-update",
        },
        { key: "PROMOTION", label: "Promotion", path: "/student/promote" },
        { key: "EXPORT", label: "Export Data", path: "/student/export" },
      ],
    },
    {
      key: "ACADEMICS",
      label: "Academics",
      icon: <FaBook />,
      children: [
        {
          key: "RESULT_FEED",
          label: "Result Feed",
          path: "/academics/result-feed",
        },
        {
          key: "ATTENDANCE",
          label: "Attendance",
          path: "/academics/attendance",
        },
        {
          key: "VIDEO_CALL",
          label: "Video Call",
          path: "/academics/vedio-call",
        },
        { key: "HOMEWORK", label: "HomeWork", path: "/academics/homework" },
        {
          key: "NOTICE",
          label: "Class Notice",
          path: "/academics/notice-class",
        },
      ],
    },
    {
      key: "FEES",
      label: "Fees",
      icon: <FaMoneyBill />,
      children: [
        {
          key: "ASSIGNMENT",
          label: "Fee Assignment",
          path: "/fees/assignment",
        },
        { key: "ANALYTIC", label: "Fee Analytics", path: "/fees/analytic" },
      ],
    },
    {
      key: "ADMIN",
      label: "Admin",
      icon: <FaCog />,
      children: [
        {
          key: "TRIGGER",
          label: "Trigger Notification",
          path: "/admin/trigger",
        },
        {
          key: "PRINT_REPORT",
          label: "Generate Report",
          path: "/admin/printreport",
        },
        {
          key: "PRINT_ID",
          label: "Generate ID Card",
          path: "/admin/printID",
        },
      ],
    },
  ];

  return (
    <div className="h-full lg:h-screen flex flex-col justify-between bg-white p-3 border-r">
      <div>
        {/* LOGO */}
        <div className="text-center">
          <img
            src={companyLogo}
            alt="Logo"
            className="w-[140px] mx-auto mb-4"
          />
        </div>

        {/* DASHBOARD */}
        {roleConfig.DASHBOARD && (
          <div
            onClick={() => handleNavigate("/home")}
            className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer ${
              isActive("/home")
                ? "bg-blue-100 text-primary font-medium"
                : "text-gray-700 hover:bg-blue-50 hover:text-primary"
            }`}
          >
            <FaHome />
            <span className="font-bold">Dashboard</span>
          </div>
        )}
        {menuItems.map((menu) => {
          const menuConfig = roleConfig[menu.key];

          // parent visible check
          if (!menuConfig?.VISIBLE) return null;

          // filter children
          const visibleChildren = menu.children.filter(
            (child) => menuConfig?.[child.key],
          );

          // agar koi child nahi → hide parent
          if (visibleChildren.length === 0) return null;

          return (
            <div key={menu.key} className="mt-4">
              <div
                onClick={() => toggleMenu(menu.key)}
                className="flex items-center gap-3 px-3 py-2 cursor-pointer text-gray-800 font-medium"
              >
                {menu.icon}
                <span>{menu.label}</span>
              </div>

              {openMenu === menu.key && (
                <div className="ml-6 space-y-1 mt-1">
                  {visibleChildren.map((child) => (
                    <div
                      key={child.key}
                      className={menuClass(child.path)}
                      onClick={() => handleNavigate(child.path)}
                    >
                      {child.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* LOGOUT */}
      <div
        onClick={logout}
        className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer text-red-500 hover:bg-red-50"
      >
        <FaSignOutAlt />
        <span>Sign Out</span>
      </div>
    </div>
  );
};

export default Sidebar;
