export interface CameraInfo {
  id: string;
  name: string;
  location: string;
  status: "active" | "offline";
  resolution: string;
  fps: number;
}

const mockCameras: CameraInfo[] = [
  {
    id: "CAM-01",
    name: "Main Entrance Port",
    location: "South Gate Crossing",
    status: "active",
    resolution: "1920x1080",
    fps: 30
  },
  {
    id: "CAM-02",
    name: "Commercial Exit Gate",
    location: "North Gate Exit",
    status: "active",
    resolution: "1920x1080",
    fps: 30
  },
  {
    id: "CAM-03",
    name: "Surveillance Dock Alpha",
    location: "Logistics Yard",
    status: "offline",
    resolution: "1280x720",
    fps: 0
  }
];

export const cameraService = {
  getCameras: async (): Promise<CameraInfo[]> => {
    // Return mock surveillance list for enterprise telemetry UI
    return Promise.resolve(mockCameras);
  }
};
