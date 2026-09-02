import React, { useEffect, useState } from "react";
import { GlassCard } from "../GlassCard/GlassCard";
import { type LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  subtext?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  glowColor?: "primary" | "accent" | "secondary";
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  subtext,
  trend,
  glowColor = "primary",
}) => {
  const [displayVal, setDisplayVal] = useState<number | string>(
    typeof value === "number" ? 0 : value
  );

  useEffect(() => {
    if (typeof value !== "number") {
      const id = setTimeout(() => setDisplayVal(value), 0);
      return () => clearTimeout(id);
    }

    // Animated count up for numerical stats
    let start = 0;
    const end = value;
    if (start === end) {
      const id = setTimeout(() => setDisplayVal(end), 0);
      return () => clearTimeout(id);
    }

    const duration = 1200; // ms
    const increment = end > 100 ? Math.ceil(end / 30) : 1;
    const stepTime = Math.max(Math.floor(duration / (end / increment)), 15);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        clearInterval(timer);
        setDisplayVal(end);
      } else {
        setDisplayVal(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  const getGlowBorder = () => {
    switch (glowColor) {
      case "accent":
        return "before:bg-brand-accent";
      case "secondary":
        return "before:bg-brand-secondary";
      case "primary":
      default:
        return "before:bg-brand-primary";
    }
  };

  return (
    <GlassCard
      className={`before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:height-[2px] before:h-[2px] ${getGlowBorder()}`}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {title}
          </p>
          <h3 className="text-3xl font-bold tracking-tight text-white font-sans text-glow">
            {displayVal}
          </h3>
          {subtext && (
            <div className="flex items-center gap-1.5 pt-1">
              {trend && (
                <span
                  className={`text-xs font-medium ${
                    trend.isPositive ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {trend.value}
                </span>
              )}
              <span className="text-xs text-slate-400">{subtext}</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-brand-primary shadow-inner">
          <Icon className="w-6 h-6 text-brand-primary" />
        </div>
      </div>
    </GlassCard>
  );
};
