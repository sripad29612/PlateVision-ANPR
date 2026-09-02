import React from "react";
import { Check, ShieldAlert, Wifi, WifiOff } from "lucide-react";

type ChipType = "camera-status" | "verification" | "ocr-engine";

interface StatusChipProps {
  type: ChipType;
  value: string; // e.g. "active", "offline", "Verified", "Flagged", "easyocr", "paddleocr"
}

export const StatusChip: React.FC<StatusChipProps> = ({ type, value }) => {
  const normVal = value?.toLowerCase();

  if (type === "camera-status") {
    const isActive = normVal === "active";
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
          isActive
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
        }`}
      >
        {isActive ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
        {isActive ? "Active" : "Offline"}
      </span>
    );
  }

  if (type === "verification") {
    // If plate starts with standard formats and isn't "No Plate Found"
    const isVerified = normVal !== "no plate found" && normVal !== "low quality" && normVal !== "";
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
          isVerified
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
        }`}
      >
        {isVerified ? (
          <>
            <Check className="w-3 h-3" />
            <span>Verified</span>
          </>
        ) : (
          <>
            <ShieldAlert className="w-3 h-3" />
            <span>Unverified</span>
          </>
        )}
      </span>
    );
  }

  if (type === "ocr-engine") {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
        {value === "paddleocr" ? "PaddleOCR Engine" : "EasyOCR Engine"}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-slate-800 text-slate-300">
      {value}
    </span>
  );
};
