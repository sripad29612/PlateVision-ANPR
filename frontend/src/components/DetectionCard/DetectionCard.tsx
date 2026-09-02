import React from "react";
import { Clock, Cpu, Layout, Maximize2 } from "lucide-react";
import { GlassCard } from "../GlassCard/GlassCard";
import { ConfidenceMeter } from "../ConfidenceMeter/ConfidenceMeter";
import { StatusChip } from "../StatusChip/StatusChip";

interface DetectionCardProps {
  plateNumber: string;
  time?: string;
  ocrEngine?: string;
  cameraName?: string;
  confidence?: number | null;
  detectionConfidence?: number | null;
  ocrConfidence?: number | null;
  score?: number | null;
  conf?: number | null;
  boundingBox?: string | [number, number, number, number];
}

export const DetectionCard: React.FC<DetectionCardProps> = ({
  plateNumber,
  time,
  ocrEngine,
  cameraName = "CAM-01 (Surveillance)",
  confidence,
  detectionConfidence,
  ocrConfidence,
  score,
  conf,
  boundingBox,
}) => {
  const isNoPlate =
    !plateNumber ||
    plateNumber.toUpperCase() === "NO PLATE FOUND" ||
    plateNumber.toUpperCase() === "NO PLATE";

  const formattedTime = time
    ? time.includes(".") 
      ? time.split(".")[0] // Strip milliseconds
      : time
    : new Date().toLocaleString();

  // Resolve confidence sources
  const detConfVal = detectionConfidence ?? conf ?? score ?? confidence ?? null;
  const ocrConfVal = ocrConfidence ?? null;
  
  // Show separate ones if both exist, otherwise fall back to generic
  const hasBoth = (detectionConfidence !== undefined && detectionConfidence !== null) && 
                  (ocrConfidence !== undefined && ocrConfidence !== null);

  return (
    <GlassCard className="border-l-4 border-l-brand-primary" hoverEffect={false}>
      <div className="flex flex-col gap-5">
        <div className="flex justify-between items-start border-b border-white/5 pb-4">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Plate Recognition Result
            </span>
            <h2
              className={`text-3xl font-extrabold tracking-widest font-mono text-glow ${
                isNoPlate ? "text-rose-400" : "text-white"
              }`}
            >
              {plateNumber || "SCANNING..."}
            </h2>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <StatusChip type="verification" value={plateNumber} />
            {ocrEngine && <StatusChip type="ocr-engine" value={ocrEngine} />}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3.5">
            <div className="flex items-center gap-2.5 text-slate-300">
              <Clock className="w-4 h-4 text-brand-primary" />
              <div className="text-xs">
                <span className="text-slate-400 block">Scanned At</span>
                <span className="font-medium font-mono">{formattedTime}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-slate-300">
              <Cpu className="w-4 h-4 text-brand-primary" />
              <div className="text-xs">
                <span className="text-slate-400 block">Camera Channel</span>
                <span className="font-medium">{cameraName}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3.5">
            <div className="flex items-center gap-2.5 text-slate-300">
              <Layout className="w-4 h-4 text-brand-primary" />
              <div className="text-xs">
                <span className="text-slate-400 block">OCR Engine Engine</span>
                <span className="font-medium font-mono capitalize">{ocrEngine || "EasyOCR"}</span>
              </div>
            </div>

            {boundingBox && (
              <div className="flex items-center gap-2.5 text-slate-300">
                <Maximize2 className="w-4 h-4 text-brand-primary" />
                <div className="text-xs">
                  <span className="text-slate-400 block">Bounding Box [xyxy]</span>
                  <span className="font-medium font-mono">
                    {Array.isArray(boundingBox)
                      ? `[${boundingBox.map(Math.round).join(", ")}]`
                      : boundingBox}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Conditional Confidence Indicators */}
        <div className="flex flex-col gap-3 pt-2">
          {hasBoth ? (
            <>
              <ConfidenceMeter confidence={detConfVal} label="Detection Confidence" />
              <ConfidenceMeter confidence={ocrConfVal} label="OCR Confidence" />
            </>
          ) : (
            <ConfidenceMeter confidence={detConfVal} label="Detection Confidence" />
          )}
        </div>
      </div>
    </GlassCard>
  );
};
