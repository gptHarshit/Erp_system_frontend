//must be used in future
import { Menu } from "lucide-react";
import HomeLabel from "../../assets/home_label_image.png";
import { useConfig } from "../../context/ConfigContext";

const TopSection = ({ onMenuClick }) => {
  const { config } = useConfig();
  const SchoolName = config.PROJECT_NAME;
  return (
    <div className="bg-white border ">
      <div className="lg:hidden px-2 py-2 space-y-2  border">
        <div className="flex items-center gap-2">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <Menu size={22} />
          </button>
          <div className="bg-primary text-white m-1 rounded-md py-3 px-3 text-center">
            <p className="text-sm font-medium">
              {`Welcome Back to ${SchoolName}`}
            </p>
          </div>
        </div>
      </div>

      <div className="hidden lg:block space-y-1 p-1">
        <div className="bg-primary text-white rounded-xl px-6 py-2 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              {`Welcome Back to ${SchoolName}`}
            </h2>
            <p className="text-sm opacity-90">
              Manage students, results, attendance and more efficiently.
            </p>
          </div>

          <div className="w-[110px] h-[110px] rounded-full overflow-hidden border-4 border-white/30 shadow-lg">
            <img
              src={HomeLabel}
              alt="Demo"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopSection;
