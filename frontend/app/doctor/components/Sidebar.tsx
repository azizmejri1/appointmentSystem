import React, { use, useState, useEffect } from "react";
import {
  LayoutDashboard,
  BarChart3,
  Calendar,
  Users,
  Settings,
  ChevronRight,
  LucideIcon,
} from "lucide-react";
import { User } from "@/interface/doctor";

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
}

interface SidebarProps {
  activeItem: string;
  onItemClick: (itemId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeItem, onItemClick }) => {
  const [firstName, setFirstName] = useState<string>("");

  const [lastName, setLastName] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const f = localStorage.getItem("firstName") || "";
      const l = localStorage.getItem("lastName") || "";
      setFirstName(f);
      setLastName(l);
    }
  }, []);

  const menuItems: MenuItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      id: "statistics",
      label: "Statistics",
      icon: BarChart3,
      path: "/statistics",
    },
    {
      id: "appointments",
      label: "Appointments",
      icon: Calendar,
      path: "/appointments",
    },
    {
      id: "patients",
      label: "Patients",
      icon: Users,
      path: "/patients",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      path: "/settings",
    },
  ];

  const handleItemClick = (itemId: string): void => {
    onItemClick(itemId);
  };

  const handleMouseEnter = (
    e: React.MouseEvent<HTMLButtonElement>,
    isActive: boolean
  ): void => {
    if (!isActive) {
      (e.target as HTMLButtonElement).style.backgroundColor = "#f9fafb";
    }
  };

  const handleMouseLeave = (
    e: React.MouseEvent<HTMLButtonElement>,
    isActive: boolean
  ): void => {
    if (!isActive) {
      (e.target as HTMLButtonElement).style.backgroundColor = "transparent";
    }
  };

  return (
    <div className="h-screen w-64 bg-white flex flex-col shadow-lg border-r border-gray-200">
      {/* Header with Profile */}
      <div
        className="px-6 py-6 border-b border-gray-200"
        style={{ backgroundColor: "#0d78d3" }}
      >
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-lg font-bold text-white shadow-md">
              DJ
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white truncate">
              Dr. {firstName} {lastName}
            </h3>
            <p className="text-xs text-white/70 truncate">Medical Director</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 pt-6 px-4">
        <ul className="space-y-2">
          {menuItems.map((item: MenuItem) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => handleItemClick(item.id)}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group
                    ${
                      isActive
                        ? "text-white font-semibold shadow-md transform hover:scale-105"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    }
                  `}
                  style={{
                    backgroundColor: isActive ? "#0d78d3" : "transparent",
                  }}
                  onMouseEnter={(e) => handleMouseEnter(e, isActive)}
                  onMouseLeave={(e) => handleMouseLeave(e, isActive)}
                >
                  <div className="flex items-center space-x-3">
                    <Icon
                      size={20}
                      className={`transition-transform duration-200 ${
                        isActive ? "scale-110" : "group-hover:scale-105"
                      }`}
                    />
                    <span className="text-sm">{item.label}</span>
                  </div>
                  <ChevronRight
                    size={16}
                    className={`transition-transform duration-200 ${
                      isActive
                        ? "rotate-90 opacity-100"
                        : "opacity-0 group-hover:opacity-50"
                    }`}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer Status */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(13, 120, 211, 0.1)" }}
            >
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500">Status</p>
              <p className="text-sm font-medium text-gray-700">Online</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
