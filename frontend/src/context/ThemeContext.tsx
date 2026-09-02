/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from "react";

interface ThemeContextType {
  theme: "dark"; // Standard dark theme as requested
  accentColor: string;
  setAccentColor: (color: string) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accentColor, setAccentColor] = useState<string>(() => {
    return localStorage.getItem("accentColor") || "#18B8FF"; // Primary color default
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem("sidebarCollapsed") === "true";
  });

  useEffect(() => {
    localStorage.setItem("accentColor", accentColor);
    document.documentElement.style.setProperty("--accent-color", accentColor);
  }, [accentColor]);

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", sidebarCollapsed.toString());
  }, [sidebarCollapsed]);

  return (
    <ThemeContext.Provider
      value={{
        theme: "dark",
        accentColor,
        setAccentColor,
        sidebarCollapsed,
        setSidebarCollapsed,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
