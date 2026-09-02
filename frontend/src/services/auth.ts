import { apiClient } from "./api";

export interface LoginResponse {
  success: boolean;
  message: string;
}

export const authService = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    const response = await apiClient.post<LoginResponse>("/login", formData, {
      headers: {
        "Content-Type": undefined,
      },
    });

    if (response.data.success) {
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("username", username);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("username");
    window.dispatchEvent(new Event("logout"));
  },

  isAuthenticated: (): boolean => {
    return localStorage.getItem("loggedIn") === "true";
  },

  getCurrentUser: (): string | null => {
    return localStorage.getItem("username");
  }
};
