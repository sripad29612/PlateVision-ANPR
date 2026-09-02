import React from "react";
import { GlassCard } from "../GlassCard/GlassCard";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  filterOption?: string;
  onFilterChange?: (opt: string) => void;
  filterOptions?: string[];
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  children,
  filterOption,
  onFilterChange,
  filterOptions = ["Daily", "Weekly", "Monthly"],
  className = "",
}) => {
  return (
    <GlassCard className={`flex flex-col h-full ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h4 className="text-base font-semibold text-slate-100">{title}</h4>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        
        {filterOption && onFilterChange && (
          <div className="flex items-center gap-1.5 p-1 bg-white/5 border border-white/5 rounded-lg w-fit">
            {filterOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => onFilterChange(opt)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  filterOption === opt
                    ? "bg-brand-primary text-white shadow-glow-primary"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex-grow w-full h-[300px] min-h-[300px]">
        {children}
      </div>
    </GlassCard>
  );
};
