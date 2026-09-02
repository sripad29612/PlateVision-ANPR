import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { Loader } from "../components/Loader/Loader";
import { Eye, EyeOff, Lock, User, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useNotifications();
  
  const [username, setUsername] = useState(() => localStorage.getItem("rememberedUsername") || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem("rememberedUsername"));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      showToast("Please provide both username and password credentials.", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(username, password);
      if (res.success) {
        showToast("Access Granted. Logging in...", "success");
        if (rememberMe) {
          localStorage.setItem("rememberedUsername", username);
        } else {
          localStorage.removeItem("rememberedUsername");
        }
      } else {
        showToast(res.message || "Invalid credentials. Try again.", "error");
      }
    } catch {
      showToast("Internal Login API failure", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg grid-bg flex flex-col items-center justify-center p-4">
      {/* Glow highlight blob */}
      <div className="absolute w-[450px] h-[450px] bg-brand-primary/10 rounded-full blur-[120px] top-1/4 left-1/2 -translate-x-1/2 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md bg-[#111B2F]/75 backdrop-blur-glass border border-white/5 rounded-3xl p-8 shadow-glass relative z-10 overflow-hidden"
      >
        {/* Brand header */}
        <div className="text-center space-y-3 mb-8">
          <div className="p-3.5 bg-gradient-to-tr from-brand-primary to-brand-accent rounded-2xl text-white shadow-glow-primary w-fit mx-auto">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-widest text-white uppercase text-glow font-sans">
              PlateVision AI
            </h1>
            <p className="text-xs text-slate-400 mt-1">Enterprise Neural ANPR Portal</p>
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 block">Operator Username</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full bg-slate-950/40 border border-white/5 focus:border-brand-primary/45 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-primary/45 transition-all"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 block">System Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter security password"
                className="w-full bg-slate-950/40 border border-white/5 focus:border-brand-primary/45 rounded-xl py-3 pl-10 pr-12 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-primary/45 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me trigger */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300 select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-white/10 bg-slate-950/40 text-brand-primary focus:ring-brand-primary focus:ring-offset-brand-bg"
              />
              <span>Remember Operator ID</span>
            </label>
          </div>

          {/* CTA Action button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-80 text-slate-950 font-extrabold rounded-xl text-sm transition-all shadow-glow-primary hover:scale-[1.01] cursor-pointer mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader size="sm" className="border-slate-950 border-t-white" />
                <span>Authenticating Console...</span>
              </>
            ) : (
              <span>Sign In to Console</span>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
