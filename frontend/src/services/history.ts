import { apiClient } from "./api";

export interface HistoryItem {
  _id: string;
  plate_number: string;
  image_path: string;
  time: string;
  confidence?: number;
  detection_confidence?: number;
  ocr_confidence?: number;
  score?: number;
  conf?: number;
}

export const historyService = {
  getHistory: async (): Promise<HistoryItem[]> => {
    const response = await apiClient.get<HistoryItem[]>("/history");
    console.log("History API Response:", response.data);
    return response.data;
  },

  deleteSingle: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/delete/${id}`);
    return response.data;
  },

  deleteBulk: async (ids: string[]): Promise<void> => {
    // Delete each selected record sequentially to maintain backend compatibility
    for (const id of ids) {
      await apiClient.delete(`/delete/${id}`);
    }
  },

  clearAll: async (): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>("/delete-history");
    return response.data;
  }
};
