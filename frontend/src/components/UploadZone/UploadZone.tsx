import React, { useCallback, useState } from "react";
import { UploadCloud, FileImage, X } from "lucide-react";
import { Loader } from "../Loader/Loader";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  previewUrl?: string;
  onClear: () => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onFileSelect,
  isLoading,
  previewUrl,
  onClear,
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: string; type: string } | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  }, []);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Invalid format. Please upload JPG or PNG images.");
      return;
    }
    
    // Format size
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    setFileInfo({
      name: file.name,
      size: `${sizeMB} MB`,
      type: file.type.split("/")[1].toUpperCase()
    });

    onFileSelect(file);
  }, [onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [processFile]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Drag & Drop Container */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`w-full h-80 rounded-2xl border-2 border-dashed relative overflow-hidden flex flex-col items-center justify-center p-6 text-center transition-all ${
          isDragActive
            ? "border-brand-primary bg-brand-primary/5 shadow-glow-primary"
            : previewUrl
            ? "border-white/10 bg-slate-900/40"
            : "border-white/10 hover:border-brand-primary/40 bg-slate-950/20"
        }`}
      >
        {previewUrl ? (
          <div className="absolute inset-0 w-full h-full group">
            <img
              src={previewUrl}
              alt="Scan Preview"
              className="w-full h-full object-contain"
            />
            {/* Visual radar scan animation overlay when loading */}
            {isLoading && (
              <div className="absolute inset-0 bg-brand-primary/5 pointer-events-none">
                <div className="animate-radar" />
              </div>
            )}

            {/* Clear Button */}
            {!isLoading && (
              <button
                onClick={() => {
                  setFileInfo(null);
                  onClear();
                }}
                className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/80 rounded-full border border-white/10 text-slate-300 hover:text-white transition-all shadow-lg"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            )}
          </div>
        ) : (
          <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center gap-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              disabled={isLoading}
              className="hidden"
            />
            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl text-slate-400 group-hover:text-slate-200 transition-colors">
              <UploadCloud className="w-10 h-10 text-brand-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">
                Drag and drop your image, or <span className="text-brand-primary">browse</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">Supports High Resolution JPG, PNG formats</p>
            </div>
          </label>
        )}

        {/* Loading Overlay spinner */}
        {isLoading && !previewUrl && (
          <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center gap-3">
            <Loader size="lg" />
            <span className="text-sm font-semibold text-slate-300">Processing YOLO/OCR Inference...</span>
          </div>
        )}
      </div>

      {/* Pre-Upload Metadata Indicators */}
      {fileInfo && previewUrl && (
        <div className="flex flex-wrap gap-4 items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl text-xs font-semibold text-slate-300">
          <div className="flex items-center gap-2">
            <FileImage className="w-4 h-4 text-brand-primary" />
            <span className="truncate max-w-[200px]">{fileInfo.name}</span>
          </div>
          <div className="flex gap-4">
            <span>Size: <span className="font-mono font-medium text-slate-400">{fileInfo.size}</span></span>
            <span>Format: <span className="font-mono font-medium text-slate-400">{fileInfo.type}</span></span>
          </div>
        </div>
      )}
    </div>
  );
};
