import { useState } from "react";
import companyLogo from "../../assets/Asset_1.png";
import {
  FaHome,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaBook,
  FaMoneyBill,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

const DemoSidebar = () => {
  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const subItemClass =
    "ml-8 px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 rounded-md cursor-pointer";

  return (
    <div className="h-screen flex flex-col justify-between bg-white p-4 border-r">


          {/* Logo */}
          <div className="text-center">
            <img
              src={companyLogo}
              alt="Logo"
              className="w-[140px] mx-auto mb-4"
            />
            {/* <h2 className="text-2xl font-semibold">Organization Login</h2> */}
          </div>

        {/* HOME */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer text-gray-800 font-medium hover:bg-blue-50">
          <FaHome />
          <span>Home</span>
        </div>

        {/* STUDENT */}
        <div className="mt-4">
          <div
            onClick={() => toggleMenu("student")}
            className="flex items-center gap-3 px-3 py-2 cursor-pointer font-medium hover:bg-blue-50 rounded-md"
          >
            <FaUserGraduate />
            <span>Student</span>
          </div>

          {openMenu === "student" && (
            <div className="mt-1 space-y-1">
              <div className={subItemClass}>A</div>
              <div className={subItemClass}>B</div>
              <div className={subItemClass}>C</div>
            </div>
          )}
        </div>

        {/* EMPLOYEES */}
        <div className="mt-4">
          <div
            onClick={() => toggleMenu("employees")}
            className="flex items-center gap-3 px-3 py-2 cursor-pointer font-medium hover:bg-blue-50 rounded-md"
          >
            <FaChalkboardTeacher />
            <span>Employees</span>
          </div>

          {openMenu === "employees" && (
            <div className="mt-1 space-y-1">
              <div className={subItemClass}>A</div>
              <div className={subItemClass}>B</div>
              <div className={subItemClass}>C</div>
            </div>
          )}
        </div>

        {/* ACADEMICS */}
        <div className="mt-4">
          <div
            onClick={() => toggleMenu("academics")}
            className="flex items-center gap-3 px-3 py-2 cursor-pointer font-medium hover:bg-blue-50 rounded-md"
          >
            <FaBook />
            <span>Academics</span>
          </div>

          {openMenu === "academics" && (
            <div className="mt-1 space-y-1">
              <div className={subItemClass}>A</div>
              <div className={subItemClass}>B</div>
              <div className={subItemClass}>C</div>
            </div>
          )}
        </div>

        {/* FEES */}
        <div className="mt-4">
          <div
            onClick={() => toggleMenu("fees")}
            className="flex items-center gap-3 px-3 py-2 cursor-pointer font-medium hover:bg-blue-50 rounded-md"
          >
            <FaMoneyBill />
            <span>Fees</span>
          </div>

          {openMenu === "fees" && (
            <div className="mt-1 space-y-1">
              <div className={subItemClass}>A</div>
              <div className={subItemClass}>B</div>
              <div className={subItemClass}>C</div>
            </div>
          )}
        </div>

        {/* ADMIN */}
        <div className="mt-4">
          <div
            onClick={() => toggleMenu("admin")}
            className="flex items-center gap-3 px-3 py-2 cursor-pointer font-medium hover:bg-blue-50 rounded-md"
          >
            <FaCog />
            <span>Admin</span>
          </div>

          {openMenu === "admin" && (
            <div className="mt-1 space-y-1">
              <div className={subItemClass}>A</div>
              <div className={subItemClass}>B</div>
              <div className={subItemClass}>C</div>
            </div>
          )}
        </div>

      </div>

      {/* SIGN OUT */}
      <div className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer text-red-500 hover:bg-red-50">
        <FaSignOutAlt />
        <span>Sign Out</span>
      </div>

    </div>
  );
};

export default DemoSidebar;
