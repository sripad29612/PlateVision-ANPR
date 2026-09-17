import React from "react";
import { Trash2, Download, Check, Eye } from "lucide-react";
import { GlassCard } from "../GlassCard/GlassCard";
import { StatusChip } from "../StatusChip/StatusChip";
import { ConfidenceMeter } from "../ConfidenceMeter/ConfidenceMeter";
import { motion } from "framer-motion";
import { getImageUrl } from "../../services/api";

export interface PlateCardProps {
  id: string;
  plateNumber: string;
  imagePath: string;
  time: string;
  cameraName?: string;
  confidence?: number | null;
  detection_confidence?: number | null;
  ocr_confidence?: number | null;
  score?: number | null;
  conf?: number | null;
  isSelected?: boolean;
  selectMode?: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
  onPreview?: () => void;
}

export const PlateCard: React.FC<PlateCardProps> = ({
  plateNumber,
  imagePath,
  time,
  cameraName = "CAM-01 (South Gate)",
  confidence,
  detection_confidence,
  ocr_confidence,
  score,
  conf,
  isSelected = false,
  selectMode = false,
  onSelect,
  onDelete,
  onPreview,
}) => {
  const imageUrl = getImageUrl(imagePath);

  const formattedTime = time.includes(".") ? time.split(".")[0] : time;

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Fetch and download the image
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `plate-${plateNumber || "unknown"}-${Date.now()}.jpg`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isNoPlate =
    !plateNumber ||
    plateNumber.toUpperCase() === "NO PLATE FOUND" ||
    plateNumber.toUpperCase() === "NO PLATE";

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <GlassCard
        className={`flex flex-col h-full overflow-hidden p-0 border-white/5 bg-slate-900/40 cursor-pointer transition-all ${
          isSelected ? "ring-2 ring-brand-primary border-brand-primary/20 bg-brand-primary/5" : ""
        }`}
        onClick={selectMode ? onSelect : onPreview}
        hoverEffect={!selectMode}
      >
        {/* Card Header Media */}
        <div className="relative aspect-video w-full overflow-hidden bg-slate-950 border-b border-white/5 group">
          {imagePath ? (
            <img
              src={imageUrl}
              alt={plateNumber}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs font-mono bg-slate-950">
              No Snapshot Available
            </div>
          )}

          {/* Grid Scanner Shader Layer */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-60 pointer-events-none" />

          {/* Checkbox Overlay for bulk delete */}
          {selectMode && (
            <div className="absolute top-3 left-3 z-10" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={onSelect}
                className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                  isSelected
                    ? "bg-brand-primary border-brand-primary text-white"
                    : "border-white/20 bg-black/40 hover:border-brand-primary text-transparent"
                }`}
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Quick Preview Hover Trigger */}
          {!selectMode && onPreview && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPreview();
              }}
              className="absolute top-3 right-3 p-2 rounded-lg bg-black/40 hover:bg-black/60 border border-white/10 backdrop-blur-md text-slate-300 hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-lg"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}

          {/* Status badge Overlay */}
          <div className="absolute bottom-3 left-3">
            <StatusChip type="verification" value={plateNumber} />
          </div>
        </div>

        {/* Card Content Details */}
        <div className="p-4 flex-grow flex flex-col justify-between gap-3">
          <div>
             <h4
              className={`text-lg font-bold tracking-widest font-mono text-glow ${
                isNoPlate ? "text-rose-400" : "text-white"
              }`}
            >
              {plateNumber || "No Plate Detected"}
            </h4>
            
            <div className="my-2.5">
              <ConfidenceMeter
                confidence={confidence ?? detection_confidence ?? ocr_confidence ?? score ?? conf ?? null}
                label="Detection Confidence"
                hideIfUnavailable={false}
              />
            </div>
            
            <div className="mt-1.5 flex flex-col gap-1 text-[11px] text-slate-400">
              <span className="font-mono">{formattedTime}</span>
              <span>Channel: {cameraName}</span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between border-t border-white/5 pt-3">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold border border-white/5 hover:border-brand-primary/20 text-slate-300 hover:text-brand-primary transition-all bg-white/5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Snapshot</span>
            </button>

            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-1.5 rounded-lg border border-white/5 hover:border-rose-500/20 text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 transition-all"
                title="Delete Scan Record"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};
