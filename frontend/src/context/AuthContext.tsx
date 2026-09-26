import { createContext, useContext, useState, useEffect, type FC, type ReactNode } from "react";
import { authService } from "../services/auth";

interface AuthContextType {
  loggedIn: boolean;
  username: string | null;
  loading: boolean;
  login: (u: string, p: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState<boolean>(() => {
    const stored = localStorage.getItem("loggedIn");
    if (stored === null) {
      // Default to logged-in as Operator for seamless initial load
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("username", "Operator");
      return true;
    }
    return stored === "true";
  });
  const [username, setUsername] = useState<string | null>(() => {
    return localStorage.getItem("username") || "Operator";
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleLogout = () => {
      setLoggedIn(false);
      setUsername(null);
    };
    window.addEventListener("logout", handleLogout);
    window.addEventListener("unauthorized", handleLogout);
    return () => {
      window.removeEventListener("logout", handleLogout);
      window.removeEventListener("unauthorized", handleLogout);
    };
  }, []);

  const login = async (u: string, p: string) => {
    setLoading(true);
    try {
      const res = await authService.login(u, p);
      if (res.success) {
        setLoggedIn(true);
        setUsername(u);
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setLoggedIn(false);
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ loggedIn, username, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
