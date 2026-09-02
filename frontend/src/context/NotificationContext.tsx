/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { Toast, type ToastType } from "../components/Toast/Toast";

export interface SystemNotification {
  id: string;
  title: string;
  description: string;
  time: Date;
  read: boolean;
  type: "detection" | "system" | "security";
  meta?: Record<string, unknown>;
}

interface NotificationContextType {
  notifications: SystemNotification[];
  addNotification: (title: string, description: string, type?: SystemNotification["type"], meta?: Record<string, unknown>) => void;
  markAllAsRead: () => void;
  clearAllNotifications: () => void;
  showToast: (message: string, type: ToastType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface ToastState {
  id: string;
  message: string;
  type: ToastType;
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const addNotification = useCallback((
    title: string,
    description: string,
    type: SystemNotification["type"] = "system",
    meta?: Record<string, unknown>
  ) => {
    const newNotif: SystemNotification = {
      id: Math.random().toString(36).substring(7),
      title,
      description,
      time: new Date(),
      read: false,
      type,
      meta,
    };
    setNotifications((prev) => [newNotif, ...prev].slice(0, 50)); // Max 50 notifications in history
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAllAsRead,
        clearAllNotifications,
        showToast,
      }}
    >
      {children}
      {/* Toast Overlay Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              onClose={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            />
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};
