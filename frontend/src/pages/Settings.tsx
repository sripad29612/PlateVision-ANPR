import React from "react";
import { GlassCard } from "../components/GlassCard/GlassCard";
import { useTheme } from "../context/ThemeContext";
import { useNotifications } from "../context/NotificationContext";
import {
  Palette,
  Bell,
  Cpu,
  Info,
  ShieldCheck,
  Check,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const Settings: React.FC = () => {
  const { accentColor, setAccentColor } = useTheme();
  const { showToast } = useNotifications();
  const { username } = useAuth();

  const accentOptions = [
    { name: "Neon Blue", value: "#18B8FF" },
    { name: "Cyan accent", value: "#00E5FF" },
    { name: "Indigo Secondary", value: "#4F7CFF" },
    { name: "Purple Highlight", value: "#a855f7" },
    { name: "Rose Alert", value: "#e11d48" },
  ];

  const handleAccentChange = (val: string) => {
    setAccentColor(val);
    showToast(`Dashboard accent updated successfully`, "success");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-wide text-white font-sans text-glow">
          Settings Console
        </h1>
        <p className="text-xs text-slate-400">System Preferences & Portal Customization</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side: General Profile & Layout customization */}
        <div className="space-y-6">
          {/* User profile details */}
          <GlassCard className="space-y-4" hoverEffect={false}>
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2 border-b border-white/5 pb-3">
              <ShieldCheck className="w-5 h-5 text-brand-primary" />
              <span>Operator Profile</span>
            </h3>

            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center text-white text-lg font-bold shadow-glow-primary uppercase">
                  {username ? username.substring(0, 2) : "OP"}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white capitalize">{username || "Operator"}</h4>
                  <p className="text-xs text-slate-400">Role: Enterprise Administrator</p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Theme Preferences */}
          <GlassCard className="space-y-4" hoverEffect={false}>
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2 border-b border-white/5 pb-3">
              <Palette className="w-5 h-5 text-brand-primary" />
              <span>Appearance Customization</span>
            </h3>

            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-semibold block">Neon Accent Color</label>
                <div className="flex flex-wrap items-center gap-2.5">
                  {accentOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleAccentChange(opt.value)}
                      className="group flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-white/5 hover:border-white/20 transition-all bg-slate-950/40 text-slate-300"
                    >
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: opt.value }}
                      />
                      <span>{opt.name}</span>
                      {accentColor === opt.value && <Check className="w-3.5 h-3.5 text-brand-primary ml-1" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Side: Alerts settings & Version details */}
        <div className="space-y-6">
          {/* Notification settings */}
          <GlassCard className="space-y-4" hoverEffect={false}>
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2 border-b border-white/5 pb-3">
              <Bell className="w-5 h-5 text-brand-primary" />
              <span>Alert Notifications</span>
            </h3>

            <div className="space-y-4 pt-2">
              <div className="flex justify-between items-center text-xs">
                <div>
                  <span className="text-slate-200 block font-semibold mb-0.5">Desktop Toast Overlays</span>
                  <span className="text-slate-400">Display popup toast messages on scan complete</span>
                </div>
                <div className="w-9 h-5 bg-brand-primary/20 border border-brand-primary/30 rounded-full p-0.5 cursor-pointer flex items-center justify-end">
                  <div className="w-3.5 h-3.5 rounded-full bg-brand-primary" />
                </div>
              </div>

              <div className="flex justify-between items-center text-xs">
                <div>
                  <span className="text-slate-200 block font-semibold mb-0.5">Auditory Alarm Alerts</span>
                  <span className="text-slate-400">Play alert tones on critical recognition</span>
                </div>
                <div className="w-9 h-5 bg-slate-800 border border-white/5 rounded-full p-0.5 cursor-pointer flex items-center justify-start">
                  <div className="w-3.5 h-3.5 rounded-full bg-slate-500" />
                </div>
              </div>
            </div>
          </GlassCard>

          {/* About Diagnostics */}
          <GlassCard className="space-y-4" hoverEffect={false}>
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2 border-b border-white/5 pb-3">
              <Cpu className="w-5 h-5 text-brand-primary" />
              <span>System Diagnostics</span>
            </h3>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Backend Port Configuration</span>
                <span className="text-slate-200 font-mono">http://127.0.0.1:8000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">API Connection Integrity</span>
                <span className="text-emerald-400 font-bold">Stable</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Active OCR Mode</span>
                <span className="text-brand-accent font-bold font-mono uppercase">EasyOCR Engine</span>
              </div>
            </div>
          </GlassCard>

          {/* About details */}
          <GlassCard className="space-y-4" hoverEffect={false}>
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2 border-b border-white/5 pb-3">
              <Info className="w-5 h-5 text-brand-primary" />
              <span>About Software</span>
            </h3>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">PlateVision Pro Version</span>
                <span className="text-slate-200 font-mono font-semibold">2.4.0-Enterprise</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">UI Client Version</span>
                <span className="text-slate-200 font-mono">1.0.0 (Vite React)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Inference Core</span>
                <span className="text-slate-200">Ultralytics YOLOv8</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
