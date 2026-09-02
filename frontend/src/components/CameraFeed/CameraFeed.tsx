import React, { useRef, useEffect } from "react";
import { Camera, CameraOff, Maximize, Play, Square, AlertTriangle, RefreshCw } from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";

interface CameraFeedProps {
  onCapture: (blob: Blob) => void;
  isLoading: boolean;
  cameraOn: boolean;
  cameraError?: string | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export const CameraFeed: React.FC<CameraFeedProps> = ({
  onCapture,
  isLoading,
  cameraOn,
  cameraError,
  startCamera,
  stopCamera,
  videoRef,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { showToast } = useNotifications();

  // Ensure video element plays if cameraOn becomes true and stream is attached
  useEffect(() => {
    if (cameraOn && videoRef.current && videoRef.current.srcObject) {
      videoRef.current.play().catch((e) => {
        console.warn("Autoplay was prevented or postponed:", e);
      });
    }
  }, [cameraOn, videoRef]);

  const handleStart = async () => {
    try {
      await startCamera();
      showToast("Surveillance Feed Started", "info");
    } catch (err: any) {
      showToast(err.message || "Camera Permission Denied", "error");
    }
  };

  const handleStop = () => {
    stopCamera();
    showToast("Surveillance Feed Suspended", "warning");
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) {
      showToast("Camera is not active.", "warning");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
      showToast("Camera frame not ready yet. Please wait.", "warning");
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        onCapture(blob);
        showToast("Frame Snapshot Captured", "success");
      } else {
        showToast("Snapshot creation failed", "error");
      }
    }, "image/jpeg", 0.95);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {
        showToast("Fullscreen Failed", "error");
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="space-y-4" ref={containerRef}>
      {/* Live Stream Viewport */}
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-white/5 shadow-glass flex items-center justify-center">
        {/* Video element is permanently mounted to keep ref active */}
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`w-full h-full object-cover scale-x-[-1] transition-opacity duration-300 ${
            cameraOn ? "opacity-100 block" : "opacity-0 hidden"
          }`}
          onLoadedMetadata={() => {
            if (videoRef.current) {
              videoRef.current.play().catch(console.warn);
            }
          }}
        />

        {!cameraOn && (
          <div className="text-center space-y-3 p-6 select-none max-w-md mx-auto">
            <div className="p-4 bg-white/5 border border-white/5 rounded-full w-fit mx-auto text-slate-500">
              {cameraError ? (
                <AlertTriangle className="w-8 h-8 text-amber-400" />
              ) : (
                <CameraOff className="w-8 h-8 text-slate-400" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">
                {cameraError ? "Camera Access Issue" : "Surveillance Channel Offline"}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {cameraError || "Start camera to enable ANPR scanning"}
              </p>
            </div>
            {cameraError && (
              <button
                onClick={handleStart}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-primary/20 hover:bg-brand-primary/30 text-brand-primary border border-brand-primary/30 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Permission</span>
              </button>
            )}
          </div>
        )}

        {/* Hidden scanning canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Visual Scanning Reticle Overlay */}
        {cameraOn && (
          <div className="absolute inset-0 border-[2px] border-dashed border-brand-primary/20 pointer-events-none flex items-center justify-center">
            {/* Radar scanner visual guides */}
            <div className="w-72 h-44 border border-brand-accent/40 rounded-xl relative">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-brand-accent" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-brand-accent" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-brand-accent" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-brand-accent" />
              {isLoading && (
                <div className="absolute inset-0 bg-brand-accent/5 overflow-hidden">
                  <div className="animate-radar" />
                </div>
              )}
            </div>
            
            {/* Status chip */}
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold text-slate-200 tracking-wider">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>LIVE CAM-01</span>
            </div>
          </div>
        )}

        {/* Utility panel controls */}
        {cameraOn && (
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-black/60 hover:bg-black/80 border border-white/10 backdrop-blur-md text-slate-300 hover:text-white transition-all shadow-lg"
              title="Toggle Fullscreen"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Button Controllers */}
      <div className="flex flex-wrap items-center gap-3">
        {!cameraOn ? (
          <button
            onClick={handleStart}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-brand-primary hover:bg-brand-primary/95 text-white transition-all hover:shadow-glow-primary hover:scale-[1.01] cursor-pointer"
          >
            <Play className="w-4.5 h-4.5 fill-current" />
            <span>Start Surveillance Feed</span>
          </button>
        ) : (
          <>
            <button
              onClick={handleCapture}
              disabled={isLoading}
              className="flex-grow flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-brand-primary to-brand-accent hover:shadow-glow-accent text-slate-950 transition-all font-bold hover:scale-[1.01] cursor-pointer"
            >
              <Camera className="w-4.5 h-4.5" />
              <span>Capture & Scan Plate</span>
            </button>
            <button
              onClick={handleStop}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold border border-rose-500/10 hover:border-rose-500/20 text-rose-400 hover:bg-rose-500/5 transition-all cursor-pointer"
            >
              <Square className="w-4.5 h-4.5 fill-current" />
              <span>Stop Feed</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
