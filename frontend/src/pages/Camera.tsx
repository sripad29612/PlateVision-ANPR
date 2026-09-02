import React, { useRef, useState, useEffect } from "react";
import { CameraFeed } from "../components/CameraFeed/CameraFeed";
import { DetectionCard } from "../components/DetectionCard/DetectionCard";
import { uploadService, type DetectionResponse } from "../services/upload";
import { useNotifications } from "../context/NotificationContext";
import { GlassCard } from "../components/GlassCard/GlassCard";
import { LayoutList, Video, Clock } from "lucide-react";

import { ConfidenceMeter } from "../components/ConfidenceMeter/ConfidenceMeter";

interface RecentCameraScan {
  id: string;
  plate: string;
  time: string;
  confidence?: number | null;
  detection_confidence?: number | null;
  ocr_confidence?: number | null;
  score?: number | null;
  conf?: number | null;
}

export const Camera: React.FC = () => {
  const { showToast, addNotification } = useNotifications();
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recentDetections, setRecentDetections] = useState<RecentCameraScan[]>([]);
  const [activeDetection, setActiveDetection] = useState<DetectionResponse | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = React.useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraOn(false);
  }, []);

  const startCamera = React.useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const msg = "Camera API (getUserMedia) is not supported or not available in this browser context.";
      setCameraError(msg);
      setCameraOn(false);
      throw new Error(msg);
    }

    setCameraError(null);

    // Clean up any stale stream first
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "environment",
          },
          audio: false,
        });
      } catch {
        // Fallback for cameras that don't support custom dimensions
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn("Video play was interrupted or pending metadata:", playErr);
        }
      }

      setCameraOn(true);
      setCameraError(null);
    } catch (err: any) {
      console.error("Camera startup error:", err);
      let errorMsg = "Unable to access camera.";
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        errorMsg = "Camera permission was denied in your browser. Please allow camera access.";
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        errorMsg = "No camera hardware detected on this device.";
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        errorMsg = "Camera is currently locked or in use by another application.";
      } else if (err.name === "OverconstrainedError") {
        errorMsg = "Requested camera resolution constraints could not be satisfied.";
      } else if (err.message) {
        errorMsg = err.message;
      }
      setCameraError(errorMsg);
      setCameraOn(false);
      throw new Error(errorMsg);
    }
  }, []);

  useEffect(() => {
    let active = true;
    startCamera().catch((err) => {
      if (active) {
        console.warn("Auto-start camera notice:", err.message);
      }
    });

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [startCamera]);

  const handleCapture = async (blob: Blob) => {
    setIsLoading(true);
    try {
      const response = await uploadService.detectBlob(blob);
      console.log("Camera.tsx Result payload:", response);
      setActiveDetection(response);

      const isNoPlate =
        !response.plate ||
        response.plate.toUpperCase() === "NO PLATE FOUND" ||
        response.plate.toUpperCase() === "NO PLATE";

      if (!isNoPlate) {
        // Prepend to recent list
        const newScan: RecentCameraScan = {
          id: Math.random().toString(36).substring(7),
          plate: response.plate,
          time: new Date().toLocaleTimeString(),
          confidence: response.confidence,
          detection_confidence: response.detection_confidence,
          ocr_confidence: response.ocr_confidence,
        };
        setRecentDetections((prev) => [newScan, ...prev].slice(0, 10));

        // Global Alert Log
        addNotification(
          "Surveillance Scan",
          `Live Camera 01 scanned vehicle plate: ${response.plate}`,
          "detection",
          { plate: response.plate, img: response.image }
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Detection failed.";
      showToast(msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-wide text-white font-sans text-glow">
          Surveillance ANPR Feed
        </h1>
        <p className="text-xs text-slate-400">Live Camera Stream OCR Recognition Portal</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Side: Live stream viewport */}
        <div className="lg:col-span-3 space-y-4">
          <GlassCard className="p-6" hoverEffect={false}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <Video className="w-5 h-5 text-brand-primary" />
                <span>Live Feed Channel-01</span>
              </h3>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${cameraOn ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                <span className="text-xs text-slate-400">{cameraOn ? "Active" : "Offline"}</span>
              </div>
            </div>

            <CameraFeed
              onCapture={handleCapture}
              isLoading={isLoading}
              cameraOn={cameraOn}
              cameraError={cameraError}
              startCamera={startCamera}
              stopCamera={stopCamera}
              videoRef={videoRef}
            />
          </GlassCard>
        </div>

        {/* Right Side: Scan details and scrolling list */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Active scanning card info */}
          {activeDetection && (
            <DetectionCard
              plateNumber={activeDetection.plate}
              time={new Date().toLocaleString()}
              ocrEngine="EasyOCR"
              confidence={activeDetection.confidence}
              ocrConfidence={activeDetection.ocr_confidence}
              detectionConfidence={activeDetection.detection_confidence}
            />
          )}

          {/* Scrolling Scans Feed */}
          <GlassCard className="flex-grow flex flex-col min-h-[300px]" hoverEffect={false}>
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
              <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <LayoutList className="w-4.5 h-4.5 text-brand-primary" />
                <span>Captured Feeds Roll</span>
              </h4>
              <span className="text-[10px] font-mono text-slate-500">Max 10 Logs</span>
            </div>

            <div className="flex-grow overflow-y-auto space-y-3.5 max-h-[280px]">
              {recentDetections.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-16">
                  <Clock className="w-8 h-8 text-slate-600 mb-2" />
                  <p className="text-xs font-semibold">Feed Roll is Empty</p>
                  <p className="text-[10px] text-slate-600 mt-0.5">Scanned plates will append here</p>
                </div>
              ) : (
                recentDetections.map((scan) => (
                  <div
                    key={scan.id}
                    className="flex justify-between items-center p-3.5 bg-white/5 border border-white/5 rounded-xl text-xs font-mono font-semibold gap-4"
                  >
                    <div>
                      <span className="text-white text-sm tracking-widest block">{scan.plate}</span>
                      <span className="text-[10px] text-slate-400 font-sans mt-0.5 block">CAM-01 Entrance</span>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 w-1/3 min-w-[120px]">
                      <span className="text-slate-400 font-sans text-[10px] block">{scan.time}</span>
                      <ConfidenceMeter
                        confidence={scan.confidence ?? scan.detection_confidence ?? scan.ocr_confidence ?? scan.score ?? scan.conf ?? null}
                        label=""
                        hideIfUnavailable={false}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
