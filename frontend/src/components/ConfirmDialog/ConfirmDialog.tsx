import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md bg-[#111B2F] border border-white/10 rounded-2xl p-6 shadow-glow-primary relative z-10 overflow-hidden"
          >
            {/* Header info */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-grow space-y-1">
                <h3 className="text-lg font-bold text-white tracking-wide">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{message}</p>
              </div>
              <button
                onClick={onCancel}
                className="text-slate-500 hover:text-slate-300 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* CTA buttons */}
            <div className="flex items-center justify-end gap-3 mt-6 border-t border-white/5 pt-4">
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-white/5 hover:border-white/20 text-slate-300 hover:text-white transition-all bg-white/5"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onCancel();
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] text-white transition-all"
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
