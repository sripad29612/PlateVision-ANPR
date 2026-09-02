import React from "react";
import { motion } from "framer-motion";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Loader: React.FC<LoaderProps> = ({ size = "md", className = "" }) => {
  const dimensions = {
    sm: "w-5 h-5 border-2",
    md: "w-8 h-8 border-[3px]",
    lg: "w-12 h-12 border-4",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${dimensions[size]} border-slate-700 border-t-brand-primary rounded-full animate-spin`}
      />
    </div>
  );
};

export const PageLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-brand-bg flex flex-col items-center justify-center gap-4 z-50">
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="text-center space-y-3"
      >
        {/* Glow spinner */}
        <div className="w-16 h-16 border-4 border-slate-800 border-t-brand-primary rounded-full animate-spin shadow-glow-primary mx-auto mb-2" />
        <h2 className="text-xl font-bold tracking-widest text-white uppercase text-glow font-sans">
          PlateVision AI
        </h2>
        <p className="text-xs text-slate-400 font-medium">Securing and Analyzing Feeds...</p>
      </motion.div>
    </div>
  );
};

export const SkeletonLoader: React.FC<{ type: "card" | "table" | "chart" }> = ({ type }) => {
  const animatePulse = "animate-pulse bg-slate-800/40 rounded-xl border border-white/5";

  if (type === "card") {
    return (
      <div className={`p-6 space-y-4 ${animatePulse}`}>
        <div className="flex justify-between items-center">
          <div className="h-3 w-24 bg-slate-700/60 rounded" />
          <div className="h-8 w-8 rounded-lg bg-slate-700/60" />
        </div>
        <div className="h-8 w-16 bg-slate-700/60 rounded" />
        <div className="h-3.5 w-32 bg-slate-700/60 rounded" />
      </div>
    );
  }

  if (type === "chart") {
    return (
      <div className={`p-6 space-y-6 h-[380px] ${animatePulse}`}>
        <div className="h-4 w-48 bg-slate-700/60 rounded" />
        <div className="flex items-end justify-between h-[260px] pt-4 px-2">
          <div className="w-[12%] h-[30%] bg-slate-700/60 rounded-t-md" />
          <div className="w-[12%] h-[55%] bg-slate-700/60 rounded-t-md" />
          <div className="w-[12%] h-[75%] bg-slate-700/60 rounded-t-md" />
          <div className="w-[12%] h-[40%] bg-slate-700/60 rounded-t-md" />
          <div className="w-[12%] h-[90%] bg-slate-700/60 rounded-t-md" />
          <div className="w-[12%] h-[60%] bg-slate-700/60 rounded-t-md" />
          <div className="w-[12%] h-[80%] bg-slate-700/60 rounded-t-md" />
        </div>
      </div>
    );
  }

  if (type === "table") {
    return (
      <div className={`w-full overflow-hidden p-4 ${animatePulse}`}>
        <div className="space-y-4">
          <div className="h-8 w-full bg-slate-700/40 rounded-lg" />
          <div className="h-10 w-full bg-slate-700/60 rounded-lg" />
          <div className="h-10 w-full bg-slate-700/40 rounded-lg" />
          <div className="h-10 w-full bg-slate-700/60 rounded-lg" />
          <div className="h-10 w-full bg-slate-700/40 rounded-lg" />
          <div className="h-10 w-full bg-slate-700/60 rounded-lg" />
        </div>
      </div>
    );
  }

  return null;
};
