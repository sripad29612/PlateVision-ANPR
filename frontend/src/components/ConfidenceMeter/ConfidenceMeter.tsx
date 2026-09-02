import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ShieldAlert, HelpCircle } from "lucide-react";

interface ConfidenceMeterProps {
  confidence?: number | null;
  label?: string;
  hideIfUnavailable?: boolean;
}

export const ConfidenceMeter: React.FC<ConfidenceMeterProps> = React.memo(({
  confidence,
  label = "System Confidence",
  hideIfUnavailable = false,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [animatedValue, setAnimatedValue] = useState(0);

  // Parse raw value
  const val = React.useMemo(() => {
    console.log("ConfidenceMeter Raw Confidence Value:", confidence);
    if (confidence === undefined || confidence === null || isNaN(confidence)) {
      return null;
    }
    let percent = confidence;
    // Map decimals (e.g. 0.9542) to percentages (95.42)
    if (confidence > 0 && confidence <= 1.0) {
      percent = confidence * 100;
    }
    return Math.round(percent * 100) / 100;
  }, [confidence]);

  // Handle animation counter
  useEffect(() => {
    if (val === null) {
      setAnimatedValue(0);
      return;
    }

    let start = 0;
    const end = val;
    if (start === end) {
      setAnimatedValue(end);
      return;
    }

    const duration = 1000; // ms
    const stepTime = 16; // ~60fps
    const steps = duration / stepTime;
    const increment = (end - start) / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        clearInterval(timer);
        setAnimatedValue(end);
      } else {
        setAnimatedValue(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [val]);

  if (val === null) {
    if (hideIfUnavailable) return null;
    return (
      <div className="flex flex-col gap-1.5 p-3.5 bg-white/5 border border-white/5 rounded-xl">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {label}
        </span>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <ShieldAlert className="w-3.5 h-3.5 text-slate-600" />
          <span>Confidence unavailable</span>
        </div>
      </div>
    );
  }

  // Color rules:
  // 90-100% -> Green
  // 75-89% -> Blue
  // 50-74% -> Yellow
  // Below 50% -> Red
  const getColorClasses = () => {
    if (val >= 90) return {
      text: "text-emerald-400",
      bg: "bg-gradient-to-r from-emerald-500 to-teal-400",
      glow: "shadow-[0_0_12px_rgba(16,185,129,0.3)]",
      border: "border-emerald-500/20"
    };
    if (val >= 75) return {
      text: "text-brand-primary",
      bg: "bg-gradient-to-r from-brand-primary to-brand-secondary",
      glow: "shadow-[0_0_12px_rgba(24,184,255,0.3)]",
      border: "border-brand-primary/20"
    };
    if (val >= 50) return {
      text: "text-amber-400",
      bg: "bg-gradient-to-r from-amber-500 to-amber-400",
      glow: "shadow-[0_0_12px_rgba(245,158,11,0.3)]",
      border: "border-amber-500/20"
    };
    return {
      text: "text-rose-500",
      bg: "bg-gradient-to-r from-rose-600 to-rose-500",
      glow: "shadow-[0_0_12px_rgba(239,68,68,0.3)]",
      border: "border-rose-500/20"
    };
  };

  const colors = getColorClasses();

  // Blocks representation (e.g. █████████████░░) -> Total 15 blocks
  const totalBlocks = 15;
  const activeBlocks = Math.round((val / 100) * totalBlocks);
  const blocksStr = "█".repeat(activeBlocks) + "░".repeat(totalBlocks - activeBlocks);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col gap-2 p-3.5 bg-slate-900/40 border rounded-xl shadow-inner relative overflow-hidden ${colors.border}`}
    >
      <div className="flex justify-between items-center relative">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck className={`w-3.5 h-3.5 ${colors.text}`} />
          <span>{label}</span>
          
          {/* Tooltip trigger icon */}
          <div className="relative inline-block cursor-help">
            <HelpCircle
              className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 transition-colors"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            />
            
            {/* Tooltip Overlay */}
            <AnimatePresence>
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 5 }}
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 w-48 p-2 rounded-lg bg-[#111B2F] border border-white/10 text-[10px] text-slate-300 font-sans font-medium shadow-glass z-50 text-center leading-normal"
                >
                  Confidence represents the detection certainty returned by the AI model.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </span>
        
        {/* Animated Percentage String */}
        <span className={`text-xs font-bold ${colors.text} font-mono text-glow`}>
          {animatedValue.toFixed(2)}%
        </span>
      </div>

      {/* String Block representation */}
      <div className="text-xs font-mono font-bold tracking-widest text-slate-600/80">
        <span className={colors.text}>{blocksStr.slice(0, activeBlocks)}</span>
        <span>{blocksStr.slice(activeBlocks)}</span>
      </div>

      {/* Visual progress loading line */}
      <div className="h-1.5 w-full bg-slate-950/60 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${val}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${colors.bg} ${colors.glow}`}
        />
      </div>
    </motion.div>
  );
});

ConfidenceMeter.displayName = "ConfidenceMeter";
