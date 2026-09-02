import React from "react";
import { motion } from "framer-motion";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
  hoverEffect?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = "",
  animate = true,
  hoverEffect = true,
  onClick,
}) => {
  const cardClasses = `glass-panel rounded-2xl p-6 shadow-glass border border-white/5 relative overflow-hidden ${
    hoverEffect ? "glass-panel-hover" : ""
  } ${className}`;

  if (!animate) {
    return <div className={cardClasses} onClick={onClick}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      viewport={{ once: true }}
      className={cardClasses}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};
