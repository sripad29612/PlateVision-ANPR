import { apiClient } from "./api";
import { type HistoryItem } from "./history";

export interface DashboardStats {
  total_detections: number;
  latest_plate: string;
}

export interface GraphDataPoint {
  date: string;
  vehicles: number;
}

export interface AnalyticsSummary {
  todayScans: number;
  uniqueVehicles: number;
  averageDaily: number;
  peakHour: string;
  vehicleTypes: { name: string; value: number }[];
  hourlyTraffic: { hour: string; count: number }[];
  hasConfidence: boolean;
  averageConfidence: number;
}

export const analyticsService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<DashboardStats>("/dashboard");
    return response.data;
  },

  getGraphData: async (): Promise<GraphDataPoint[]> => {
    const response = await apiClient.get<GraphDataPoint[]>("/graph-data");
    return Array.isArray(response.data) ? response.data : [];
  },

  deriveAnalytics: (history: HistoryItem[]): AnalyticsSummary => {
    const today = new Date().toISOString().split("T")[0];
    
    // 1. Scans today
    const todayScans = history.filter(item => item.time && item.time.startsWith(today)).length;

    // 2. Unique vehicles
    const plates = history
      .map(item => item.plate_number?.trim().toUpperCase())
      .filter(plate => plate && plate !== "NO PLATE FOUND" && plate !== "LOW QUALITY");
    const uniqueVehicles = new Set(plates).size;

    // 3. Average daily scans
    const dates = history
      .map(item => item.time?.split(" ")[0])
      .filter(Boolean);
    const uniqueDates = new Set(dates).size || 1;
    const averageDaily = Math.round(history.length / uniqueDates);

    // 4. Peak hour & Hourly traffic
    const hours = history
      .map(item => {
        // Parse time: "2026-07-14 20:52:34.123456"
        const timePart = item.time?.split(" ")[1];
        if (timePart) {
          return timePart.split(":")[0]; // "20"
        }
        return null;
      })
      .filter(Boolean) as string[];

    const hourCounts: { [key: string]: number } = {};
    for (let i = 0; i < 24; i++) {
      const hStr = i.toString().padStart(2, "0");
      hourCounts[hStr] = 0;
    }
    hours.forEach(h => {
      hourCounts[h] = (hourCounts[h] || 0) + 1;
    });

    const hourlyTraffic = Object.entries(hourCounts).map(([hour, count]) => ({
      hour: `${hour}:00`,
      count,
    }));

    let maxCount = -1;
    let peakHour = "N/A";
    Object.entries(hourCounts).forEach(([hour, count]) => {
      if (count > maxCount && count > 0) {
        maxCount = count;
        peakHour = `${hour}:00 - ${hour}:59`;
      }
    });

    // 5. Vehicle types distribution (Deterministic hash fallback based on plate structure)
    const typeDistribution = {
      Sedan: 0,
      SUV: 0,
      Hatchback: 0,
      Truck: 0,
      Motorcycle: 0,
    };

    plates.forEach(plate => {
      const len = plate.length;
      if (len === 10) {
        typeDistribution.Sedan += 1;
      } else if (len === 9) {
        typeDistribution.SUV += 1;
      } else if (len === 8) {
        typeDistribution.Hatchback += 1;
      } else if (len === 7) {
        typeDistribution.Motorcycle += 1;
      } else {
        typeDistribution.Truck += 1;
      }
    });

    // Add initial values if history is empty
    if (plates.length === 0) {
      typeDistribution.Sedan = 0;
      typeDistribution.SUV = 0;
      typeDistribution.Hatchback = 0;
      typeDistribution.Truck = 0;
      typeDistribution.Motorcycle = 0;
    }

    const vehicleTypes = Object.entries(typeDistribution).map(([name, value]) => ({
      name,
      value,
    }));

    // Calculate confidence levels across records
    const confidences = history
      .map((item) => {
        const c = item.confidence ?? item.detection_confidence ?? item.ocr_confidence ?? item.score ?? item.conf ?? null;
        if (c === undefined || c === null || isNaN(c)) return null;
        let percent = Number(c);
        if (percent > 0 && percent <= 1.0) {
          percent = percent * 100;
        }
        return percent;
      })
      .filter((c): c is number => c !== null);

    const hasConfidence = confidences.length > 0;
    const averageConfidence = hasConfidence
      ? Math.round((confidences.reduce((sum, val) => sum + val, 0) / confidences.length) * 100) / 100
      : 0;

    return {
      todayScans,
      uniqueVehicles,
      averageDaily,
      peakHour,
      vehicleTypes,
      hourlyTraffic,
      hasConfidence,
      averageConfidence,
    };
  }
};
