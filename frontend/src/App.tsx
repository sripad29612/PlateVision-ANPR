import { useState, type FC } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { NotificationProvider } from "./context/NotificationContext";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { Navbar } from "./components/Navbar/Navbar";
import { Dashboard } from "./pages/Dashboard";
import { Upload } from "./pages/Upload";
import { Camera } from "./pages/Camera";
import { History } from "./pages/History";
import { Analytics } from "./pages/Analytics";
import { Settings } from "./pages/Settings";
import { Login } from "./pages/Login";
import { NotFound } from "./pages/NotFound";

const MainLayout: FC = () => {
  const { loggedIn, loading } = useAuth();
  const [globalSearch, setGlobalSearch] = useState("");

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!loggedIn) {
    return <Login />;
  }

  return (
    <div className="flex min-h-screen bg-brand-bg text-slate-100 overflow-x-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar searchValue={globalSearch} onSearchChange={setGlobalSearch} />
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/camera" element={<Camera />} />
            <Route path="/history" element={<History />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export const App: FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          <BrowserRouter>
            <MainLayout />
          </BrowserRouter>
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;