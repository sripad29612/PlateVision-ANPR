/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext } from "react";

interface AuthContextType {
  loggedIn: boolean;
  username: string | null;
  loading: boolean;
  login: (u: string, p: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const loggedIn = true;
  const username = "Operator";
  const loading = false;

  const login = async () => {
    return { success: true, message: "Logged in" };
  };

  const logout = () => {
    // No-op
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
