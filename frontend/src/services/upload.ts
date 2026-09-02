import { apiClient } from "./api";

export interface DetectionResponse {
  plate: string;
  image: string; // The saved file path (e.g. "uploads/...")
  error?: string;
  // Optional confidence scores (might exist if backend is updated later)
  confidence?: number;
  detection_confidence?: number;
  ocr_confidence?: number;
}

export const uploadService = {
  detectPlate: async (file: File): Promise<DetectionResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<DetectionResponse>("/detect", formData, {
      headers: {
        "Content-Type": undefined,
      },
    });

    console.log("Detection Response (File Upload):", response.data);
    return response.data;
  },

  detectBlob: async (blob: Blob, filename = "webcam.jpg"): Promise<DetectionResponse> => {
    const formData = new FormData();
    formData.append("file", blob, filename);

    const response = await apiClient.post<DetectionResponse>("/detect", formData, {
      headers: {
        "Content-Type": undefined,
      },
    });

    console.log("Detection Response (Camera Blob):", response.data);
    return response.data;
  }
};
