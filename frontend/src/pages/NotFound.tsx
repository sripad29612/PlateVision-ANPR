import React from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { GlassCard } from "../components/GlassCard/GlassCard";

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <GlassCard className="p-8 border-rose-500/10 flex flex-col items-center gap-4 text-center" hoverEffect={false}>
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full w-fit">
            <AlertCircle className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide uppercase">404 - Channel Not Found</h2>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              The layout channel or route you requested does not exist or has been relocated within the system grid.
            </p>
          </div>
          <Link
            to="/"
            className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-brand-primary hover:bg-brand-primary/95 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-glow-primary hover:scale-[1.01]"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        </GlassCard>
      </motion.div>
    </div>
  );
};
