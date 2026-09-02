import React from "react";
import { NavLink } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import {
  LayoutDashboard,
  Upload,
  Camera,
  History,
  BarChart2,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";

export const Sidebar: React.FC = () => {
  const { sidebarCollapsed, setSidebarCollapsed } = useTheme();

  const menuItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Upload Scan", path: "/upload", icon: Upload },
    { name: "Live Camera", path: "/camera", icon: Camera },
    { name: "History Logs", path: "/history", icon: History },
    { name: "Traffic Analytics", path: "/analytics", icon: BarChart2 },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <motion.div
      animate={{ width: sidebarCollapsed ? 80 : 260 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-screen sticky top-0 left-0 bg-[#0c1524]/90 backdrop-blur-md border-r border-white/5 flex flex-col justify-between py-6 z-20 flex-shrink-0"
    >
      {/* Sidebar Header Logo */}
      <div className="px-5 flex items-center justify-between relative">
        <NavLink to="/" className="flex items-center gap-3 overflow-hidden select-none">
          <div className="p-2 bg-gradient-to-tr from-brand-primary to-brand-accent rounded-xl text-white shadow-glow-primary flex-shrink-0">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          {!sidebarCollapsed && (
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-lg font-bold text-white tracking-wider uppercase font-sans text-glow"
            >
              PlateVision
            </motion.h2>
          )}
        </NavLink>

        {/* Collapsible toggle trigger button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 bg-brand-primary hover:bg-brand-primary/80 text-white rounded-full p-1 border border-white/10 hover:shadow-glow-primary transition-all z-30"
        >
          {sidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Nav Menu Items */}
      <nav className="flex-grow mt-10 px-3 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all group relative overflow-hidden ${
                isActive
                  ? "bg-brand-primary/10 text-brand-primary border border-brand-primary/20 shadow-glow-primary/5 font-semibold"
                  : "text-slate-400 hover:text-slate-200 border border-transparent hover:bg-white/5"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? "text-brand-primary" : "text-slate-400 group-hover:text-slate-200"}`} />
                {!sidebarCollapsed && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="truncate">
                    {item.name}
                  </motion.span>
                )}
                {/* Visual active neon glowing bar */}
                {isActive && (
                  <motion.div
                    layoutId="activeBar"
                    className="absolute left-0 top-1/4 h-1/2 w-[3px] bg-brand-primary rounded-r-full shadow-glow-primary"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </motion.div>
  );
};
