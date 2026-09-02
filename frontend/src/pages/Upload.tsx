import React, { useState } from "react";
import { UploadZone } from "../components/UploadZone/UploadZone";
import { DetectionCard } from "../components/DetectionCard/DetectionCard";
import { uploadService, type DetectionResponse } from "../services/upload";
import { useNotifications } from "../context/NotificationContext";
import { GlassCard } from "../components/GlassCard/GlassCard";
import { FileSymlink, Image as ImageIcon, Sparkles, RefreshCw } from "lucide-react";

export const Upload: React.FC = () => {
  const { showToast, addNotification } = useNotifications();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DetectionResponse | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
  };

  const handleScan = async () => {
    if (!selectedFile) {
      showToast("Please select an image file first", "warning");
      return;
    }

    setIsLoading(true);
    showToast("Starting ANPR Scanning Pipeline...", "info");

    try {
      const response = await uploadService.detectPlate(selectedFile);
      console.log("Upload.tsx Result payload:", response);
      setResult(response);

      // Register notification alert
      const isNoPlate =
        !response.plate ||
        response.plate.toUpperCase() === "NO PLATE FOUND" ||
        response.plate.toUpperCase() === "NO PLATE";

      if (isNoPlate) {
        showToast("Inference Complete. No plates identified.", "warning");
        addNotification("Scan Refused", "No valid license plates detected in the uploaded frame", "system");
      } else {
        showToast(`Plate Recognized: ${response.plate}`, "success");
        addNotification(
          "Plate Scanned",
          `Recognized vehicle number ${response.plate} successfully.`,
          "detection",
          { plate: response.plate, img: response.image }
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to scan plate. Backend connection failure.";
      showToast(msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-wide text-white font-sans text-glow">
          Batch Upload Scanner
        </h1>
        <p className="text-xs text-slate-400">ANPR Recognition & Extraction from Uploaded Images</p>
      </div>

      {/* Main Upload Content Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Side: Upload zone and action */}
        <div className="lg:col-span-3 space-y-4">
          <GlassCard className="h-full flex flex-col justify-between" hoverEffect={false}>
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-brand-primary" />
                <span>Upload Media Frame</span>
              </h3>
              
              <UploadZone
                onFileSelect={handleFileSelect}
                isLoading={isLoading}
                previewUrl={previewUrl}
                onClear={handleClear}
              />
            </div>

            {/* Scan triggers CTA */}
            {selectedFile && !result && (
              <div className="mt-6 border-t border-white/5 pt-4">
                <button
                  onClick={handleScan}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 bg-brand-primary hover:bg-brand-primary/90 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-glow-primary hover:scale-[1.01]"
                >
                  <Sparkles className="w-4.5 h-4.5" />
                  <span>Execute Neural OCR Scan</span>
                </button>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Right Side: Recognized results display */}
        <div className="lg:col-span-2">
          {result ? (
            <div className="space-y-4">
              <DetectionCard
                plateNumber={result.plate}
                time={new Date().toLocaleString()}
                ocrEngine="EasyOCR"
                confidence={result.confidence}
                ocrConfidence={result.ocr_confidence}
                detectionConfidence={result.detection_confidence}
              />

              {/* Reset scan card */}
              <GlassCard className="text-center p-6 border-brand-primary/10">
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  OCR inference executed successfully. Ready to process another file channel.
                </p>
                <button
                  onClick={handleClear}
                  className="flex items-center justify-center gap-2 px-4 py-2 mx-auto border border-white/5 hover:border-brand-primary/20 bg-white/5 text-slate-300 hover:text-white rounded-xl text-xs transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Scan Channel</span>
                </button>
              </GlassCard>
            </div>
          ) : (
            <div className="h-full min-h-[300px]">
              <GlassCard className="h-full flex flex-col items-center justify-center text-center p-8 gap-4 border-dashed border-white/5">
                <div className="p-4 bg-white/5 border border-white/5 rounded-full w-fit mx-auto text-slate-500">
                  <FileSymlink className="w-8 h-8 text-slate-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">Awaiting Recognition Data</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-[200px] mx-auto leading-normal">
                    Select a frame and run the neural scan to view plate bounding boxes and OCR results.
                  </p>
                </div>
              </GlassCard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
