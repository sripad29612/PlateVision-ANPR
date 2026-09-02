import React, { useState, useRef, useEffect } from "react";
import { Search, Bell, User, Clock, Trash2 } from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";
import { useAuth } from "../../context/AuthContext";
import { AnimatePresence, motion } from "framer-motion";

interface NavbarProps {
  onSearchChange?: (val: string) => void;
  searchValue?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onSearchChange, searchValue = "" }) => {
  const { notifications, markAllAsRead, clearAllNotifications } = useNotifications();
  const { username } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <header className="sticky top-0 right-0 w-full h-16 border-b border-white/5 bg-[#07101f]/60 backdrop-blur-md flex items-center justify-between px-6 z-10">
      {/* Global Search Bar */}
      <div className="w-96 relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="Search recognized vehicle plates..."
          className="w-full bg-white/5 border border-white/5 focus:border-brand-primary/40 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-primary/40 transition-all font-sans"
        />
      </div>

      {/* Action utilities */}
      <div className="flex items-center gap-4">
        {/* Notifications Ticker */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setNotifOpen(!notifOpen);
              if (!notifOpen) markAllAsRead();
            }}
            className="p-2.5 bg-white/5 border border-white/5 hover:border-brand-primary/20 rounded-xl text-slate-300 hover:text-brand-primary hover:shadow-glow-primary/10 transition-all"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-brand-primary text-white text-[10px] font-bold w-4.5 h-4.5 flex items-center justify-center rounded-full border-2 border-brand-bg shadow-glow-primary">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-3 w-80 bg-[#111B2F] border border-white/10 rounded-2xl shadow-glow-primary overflow-hidden z-30"
              >
                <div className="flex justify-between items-center p-4 border-b border-white/5 bg-slate-950/40">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Detections Feed
                  </h4>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-slate-400 hover:text-rose-400 p-1 transition-colors"
                      title="Clear Feed"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-xs font-medium">
                      No recent activity scanned
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3.5 flex gap-2.5 transition-colors ${
                          notif.read ? "bg-transparent" : "bg-brand-primary/5"
                        }`}
                      >
                        <div className="flex-grow space-y-1">
                          <div className="text-xs font-bold text-slate-200">{notif.title}</div>
                          <div className="text-[11px] text-slate-400 leading-relaxed">
                            {notif.description}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-slate-500">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(notif.time).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Avatar Panel */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-3 p-1.5 pr-3 bg-white/5 border border-white/5 hover:border-brand-primary/20 rounded-xl transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center text-white font-bold shadow-glow-primary">
              {username ? username.substring(0, 2).toUpperCase() : <User className="w-4 h-4" />}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-xs font-bold text-slate-200 capitalize">{username || "Operator"}</div>
              <div className="text-[10px] text-slate-400">Enterprise Admin</div>
            </div>
          </button>

          {/* Profile Dropdown */}
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-3 w-56 bg-[#111B2F] border border-white/10 rounded-xl p-3 shadow-glow-primary z-30"
              >
                <div className="px-3 py-2 border-b border-white/5 mb-2 text-left">
                  <p className="text-xs text-slate-400">Role Status</p>
                  <p className="text-sm font-semibold text-brand-primary uppercase font-mono">
                    Administrator
                  </p>
                </div>
                <div className="text-xs text-slate-400 p-3 leading-relaxed">
                  Managing PlateVision AI backend server at localhost:8000.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
