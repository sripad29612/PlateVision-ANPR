import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

/**
 * Builds a clean, fully-qualified URL for images served by the backend,
 * avoiding double slashes or broken relative paths.
 */
export const getImageUrl = (imagePath?: string): string => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  const cleanBase = API_BASE_URL.replace(/\/+$/, "");
  const cleanPath = imagePath.replace(/^\/+/, "");
  return `${cleanBase}/${cleanPath}`;
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60s timeout for cold starts and inference
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Auto retry transient network failures once
    if (error.code === 'ECONNABORTED' && !originalRequest._retry) {
      originalRequest._retry = true;
      console.warn("API request timed out. Retrying once...");
      return apiClient(originalRequest);
    }

    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        // Clear authentication and redirect to login if unauthorized
        localStorage.removeItem("loggedIn");
        window.dispatchEvent(new Event("unauthorized"));
      }
      return Promise.reject({
        status,
        message: error.response.data?.detail || error.response.data?.message || "Server Error",
        data: error.response.data
      });
    }

    // Network errors (backend offline)
    return Promise.reject({
      status: 0,
      message: "Backend Offline. Please check your connection.",
      data: null
    });
  }
);

export const checkApiHealth = async (): Promise<boolean> => {
  try {
    // Check health by invoking the /dashboard endpoint
    await apiClient.get("/dashboard");
    return true;
  } catch {
    return false;
  }
};
