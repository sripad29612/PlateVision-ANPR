import React, { useEffect, useState, useMemo } from "react";
import { historyService, type HistoryItem } from "../services/history";
import { useNotifications } from "../context/NotificationContext";
import { GlassCard } from "../components/GlassCard/GlassCard";
import { StatusChip } from "../components/StatusChip/StatusChip";
import { ConfirmDialog } from "../components/ConfirmDialog/ConfirmDialog";
import { PlateCard } from "../components/PlateCard/PlateCard";
import { ConfidenceMeter } from "../components/ConfidenceMeter/ConfidenceMeter";
import { SkeletonLoader } from "../components/Loader/Loader";
import { checkApiHealth, getImageUrl } from "../services/api";
import {
  Search,
  Filter,
  Trash2,
  Download,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  FileCode,
  X,
  AlertTriangle,
  FolderOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const History: React.FC = () => {
  const { showToast } = useNotifications();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'verified', 'unverified'
  const [dateFilter, setDateFilter] = useState("");

  // Bulk operation states
  const [selectMode, setSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  // Dialog confirmation states
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<"single" | "bulk" | "all">("single");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Preview Modal state
  const [previewItem, setPreviewItem] = useState<HistoryItem | null>(null);

  const fetchHistory = async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      const healthy = await checkApiHealth();
      if (!healthy) {
        setIsOffline(true);
        return;
      }
      setIsOffline(false);
      const data = await historyService.getHistory();
      setHistory(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch logs.";
      showToast(msg, "error");
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const init = async () => {
      try {
        await fetchHistory(false);
      } finally {
        if (active) setLoading(false);
      }
    };
    init();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter history records
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      // 1. Text Search Filter
      const term = search.toLowerCase();
      const matchesSearch = item.plate_number?.toLowerCase().includes(term);

      // 2. Status Badge Filter
      const isVerified =
        item.plate_number &&
        item.plate_number.toUpperCase() !== "NO PLATE FOUND" &&
        item.plate_number.toUpperCase() !== "LOW QUALITY";
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "verified" && isVerified) ||
        (statusFilter === "unverified" && !isVerified);

      // 3. Date Filter
      const matchesDate =
        !dateFilter || (item.time && item.time.startsWith(dateFilter));

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [history, search, statusFilter, dateFilter]);

  // Paginated records
  const paginatedHistory = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredHistory.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredHistory, currentPage]);

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage) || 1;

  // Bulk selection controls
  const handleToggleSelect = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((i) => i !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.length === paginatedHistory.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(paginatedHistory.map((item) => item._id));
    }
  };

  // Perform Deletes
  const executeDelete = async () => {
    try {
      if (confirmTarget === "single" && deleteTargetId) {
        await historyService.deleteSingle(deleteTargetId);
        showToast("Log Record deleted", "success");
      } else if (confirmTarget === "bulk") {
        await historyService.deleteBulk(selectedItems);
        showToast(`Successfully deleted ${selectedItems.length} records`, "success");
        setSelectedItems([]);
        setSelectMode(false);
      } else if (confirmTarget === "all") {
        await historyService.clearAll();
        showToast("All recognition records deleted", "warning");
      }
      fetchHistory();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Operation failed";
      showToast(msg, "error");
    }
  };

  // Client Side Exporters
  const exportCSV = () => {
    if (filteredHistory.length === 0) {
      showToast("No data to export", "warning");
      return;
    }
    const headers = ["ID", "Plate Number", "Time Date", "Camera Source"];
    const rows = filteredHistory.map((item) => [
      item._id,
      item.plate_number,
      item.time,
      "CAM-01 (South Gate Entrance)",
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `platevision-anpr-report-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV report downloaded", "success");
  };

  const exportJSON = () => {
    if (filteredHistory.length === 0) {
      showToast("No data to export", "warning");
      return;
    }
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(filteredHistory, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `platevision-anpr-data-${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("JSON report downloaded", "success");
  };

  if (isOffline) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center max-w-lg mx-auto h-[70vh]">
        <GlassCard className="border-rose-500/20 text-center flex flex-col items-center p-8 gap-4">
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full w-fit">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">SYSTEM OFFLINE</h2>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              History server database connection is offline. Verify uvicorn FastAPI is running.
            </p>
          </div>
          <button
            onClick={() => fetchHistory(true)}
            className="px-5 py-2.5 bg-brand-primary text-slate-950 font-bold rounded-xl text-xs"
          >
            Retry Connection
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-wide text-white font-sans text-glow">
            Surveillance Logs
          </h1>
          <p className="text-xs text-slate-400">Database Records Archive & Exports</p>
        </div>

        {/* Action triggers */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-brand-primary/10 border border-white/5 hover:border-brand-primary/20 text-slate-300 hover:text-brand-primary rounded-xl text-xs font-semibold transition-all"
            title="Download CSV"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={exportJSON}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-brand-primary/10 border border-white/5 hover:border-brand-primary/20 text-slate-300 hover:text-brand-primary rounded-xl text-xs font-semibold transition-all"
            title="Download JSON"
          >
            <FileCode className="w-4 h-4" />
            <span>Export JSON</span>
          </button>
          
          <button
            onClick={() => {
              setConfirmTarget("all");
              setShowConfirm(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 hover:border-rose-500/20 text-rose-400 hover:text-rose-300 rounded-xl text-xs font-semibold transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>Purge All Logs</span>
          </button>
        </div>
      </div>

      {/* Query Filters Panel */}
      <GlassCard className="p-4 flex flex-col md:flex-row md:items-center gap-4" hoverEffect={false}>
        {/* Search Input */}
        <div className="relative flex-grow">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search recognized vehicle plates..."
            className="w-full bg-slate-950/40 border border-white/5 focus:border-brand-primary/45 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-primary/45 transition-all"
          />
        </div>

        {/* Drop filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status filter */}
          <div className="flex items-center gap-1.5 bg-slate-950/40 border border-white/5 rounded-xl px-3 py-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-slate-200 border-none outline-none font-medium text-xs cursor-pointer"
            >
              <option value="all">All Verification Statuses</option>
              <option value="verified">Verified Plates</option>
              <option value="unverified">Unverified Plates</option>
            </select>
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-1.5 bg-slate-950/40 border border-white/5 rounded-xl px-3 py-1.5 text-xs text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-slate-200 border-none outline-none text-xs cursor-pointer font-medium"
            />
          </div>
        </div>
      </GlassCard>

      {/* Grid Mode & Bulk Selection */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-400">
          Showing <span className="text-slate-200 font-bold">{filteredHistory.length}</span> entries found
        </div>
        <div className="flex items-center gap-2">
          {selectMode ? (
            <>
              <button
                onClick={handleSelectAll}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-semibold text-slate-200"
              >
                {selectedItems.length === paginatedHistory.length ? "Deselect All" : "Select Page"}
              </button>
              {selectedItems.length > 0 && (
                <button
                  onClick={() => {
                    setConfirmTarget("bulk");
                    setShowConfirm(true);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 rounded-lg text-xs font-semibold text-white shadow-lg transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected ({selectedItems.length})</span>
                </button>
              )}
              <button
                onClick={() => {
                  setSelectMode(false);
                  setSelectedItems([]);
                }}
                className="px-3 py-1.5 border border-white/5 text-xs font-semibold text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setSelectMode(true)}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-xs font-semibold text-slate-300"
            >
              Batch Selection
            </button>
          )}
        </div>
      </div>

      {/* Main Grid View */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <SkeletonLoader type="card" />
          <SkeletonLoader type="card" />
          <SkeletonLoader type="card" />
          <SkeletonLoader type="card" />
        </div>
      ) : filteredHistory.length === 0 ? (
        <GlassCard className="text-center py-20 flex flex-col items-center gap-4">
          <div className="p-4 bg-white/5 border border-white/5 rounded-full w-fit text-slate-500">
            <FolderOpen className="w-8 h-8 text-slate-400" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-200">No logs found</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-[200px] mx-auto leading-normal">
              Try adjusting your date filters or search parameters.
            </p>
          </div>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {paginatedHistory.map((item) => (
            <PlateCard
              key={item._id}
              id={item._id}
              plateNumber={item.plate_number}
              imagePath={item.image_path}
              time={item.time}
              confidence={item.confidence}
              detection_confidence={item.detection_confidence}
              ocr_confidence={item.ocr_confidence}
              score={item.score}
              conf={item.conf}
              isSelected={selectedItems.includes(item._id)}
              selectMode={selectMode}
              onSelect={() => handleToggleSelect(item._id)}
              onDelete={() => {
                setDeleteTargetId(item._id);
                setConfirmTarget("single");
                setShowConfirm(true);
              }}
              onPreview={() => setPreviewItem(item)}
            />
          ))}
        </div>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-white/5 pt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/5 text-xs text-slate-400 hover:text-white disabled:opacity-50 transition-all font-semibold"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev</span>
          </button>
          
          <span className="text-xs font-semibold text-slate-400">
            Page <span className="text-slate-200 font-bold">{currentPage}</span> of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/5 text-xs text-slate-400 hover:text-white disabled:opacity-50 transition-all font-semibold"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Full preview image modal overlay */}
      <AnimatePresence>
        {previewItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewItem(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl bg-[#111B2F] border border-white/10 rounded-2xl p-6 shadow-glow-primary z-10 flex flex-col md:flex-row gap-6 max-h-[85vh] overflow-y-auto"
            >
              {/* Media image */}
              <div className="md:w-3/5 aspect-video bg-slate-950 border border-white/5 rounded-xl overflow-hidden shadow-inner">
                <img
                  src={getImageUrl(previewItem.image_path)}
                  alt={previewItem.plate_number}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Data attributes description */}
              <div className="md:w-2/5 flex flex-col justify-between gap-5">
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <h3 className="text-base font-bold text-white tracking-wide">Inference Details</h3>
                    <button
                      onClick={() => setPreviewItem(null)}
                      className="text-slate-400 hover:text-slate-200 transition-colors p-1"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="text-xs">
                      <span className="text-slate-400 block mb-1">Plate Number</span>
                      <span className="text-2xl font-black tracking-widest font-mono text-glow text-white">
                        {previewItem.plate_number}
                      </span>
                    </div>

                    <div className="text-xs">
                      <span className="text-slate-400 block mb-0.5">Scanned Date Time</span>
                      <span className="font-mono text-slate-200 font-medium">{previewItem.time}</span>
                    </div>

                    <div className="text-xs">
                      <span className="text-slate-400 block mb-0.5">Camera Channel</span>
                      <span className="text-slate-200 font-medium">CAM-01 Entrance Channel</span>
                    </div>

                    {/* Confidence score details */}
                    <div className="pt-3.5 border-t border-white/5 space-y-2.5">
                      {((previewItem.detection_confidence !== undefined && previewItem.detection_confidence !== null) &&
                        (previewItem.ocr_confidence !== undefined && previewItem.ocr_confidence !== null)) ? (
                        <>
                          <ConfidenceMeter confidence={previewItem.detection_confidence} label="Detection Confidence" />
                          <ConfidenceMeter confidence={previewItem.ocr_confidence} label="OCR Confidence" />
                        </>
                      ) : (
                        <ConfidenceMeter
                          confidence={previewItem.confidence ?? previewItem.detection_confidence ?? previewItem.ocr_confidence ?? previewItem.score ?? previewItem.conf ?? null}
                          label="Detection Confidence"
                          hideIfUnavailable={false}
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                  <StatusChip type="verification" value={previewItem.plate_number} />
                  <a
                    href={getImageUrl(previewItem.image_path)}
                    download={`plate-${previewItem.plate_number}.jpg`}
                    target="_blank"
                    className="flex-grow flex items-center justify-center gap-1.5 px-4 py-2 bg-brand-primary text-slate-950 font-bold rounded-xl text-xs transition-all hover:shadow-glow-primary"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Original</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        title={
          confirmTarget === "single"
            ? "Delete Scan Record?"
            : confirmTarget === "bulk"
            ? `Delete ${selectedItems.length} Records?`
            : "Purge Database Records?"
        }
        message={
          confirmTarget === "single"
            ? "Are you sure you want to delete this scan entry from database history? This action is permanent."
            : confirmTarget === "bulk"
            ? `Are you sure you want to delete the ${selectedItems.length} selected scan entries from history? This action is permanent.`
            : "Are you sure you want to wipe the entire database history? This will delete all logged recognition records permanently."
        }
        confirmText="Confirm Delete"
        onConfirm={executeDelete}
        onCancel={() => {
          setShowConfirm(false);
          setDeleteTargetId(null);
        }}
      />
    </div>
  );
};
