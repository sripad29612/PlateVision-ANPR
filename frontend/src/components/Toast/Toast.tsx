import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="text-emerald-400 w-5 h-5 flex-shrink-0" />;
      case "error":
        return <AlertCircle className="text-rose-400 w-5 h-5 flex-shrink-0" />;
      case "warning":
        return <AlertTriangle className="text-amber-400 w-5 h-5 flex-shrink-0" />;
      case "info":
      default:
        return <Info className="text-brand-primary w-5 h-5 flex-shrink-0" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case "success":
        return "border-emerald-500/20 shadow-emerald-950/20";
      case "error":
        return "border-rose-500/20 shadow-rose-950/20";
      case "warning":
        return "border-amber-500/20 shadow-amber-950/20";
      case "info":
      default:
        return "border-brand-primary/20 shadow-sky-950/20";
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9, transition: { duration: 0.2 } }}
      className={`pointer-events-auto flex items-center gap-3 w-full p-4 rounded-xl border glass-panel shadow-lg ${getBorderColor()}`}
    >
      {getIcon()}
      <p className="text-sm font-medium text-slate-200 flex-grow">{message}</p>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-md hover:bg-white/5"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};
