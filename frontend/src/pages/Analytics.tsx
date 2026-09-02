import React, { useEffect, useState, useMemo } from "react";
import { historyService, type HistoryItem } from "../services/history";
import { analyticsService } from "../services/analytics";
import { checkApiHealth } from "../services/api";
import { ChartCard } from "../components/ChartCard/ChartCard";
import { GlassCard } from "../components/GlassCard/GlassCard";
import { SkeletonLoader } from "../components/Loader/Loader";
import { useNotifications } from "../context/NotificationContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { AlertTriangle, FileBarChart, ShieldCheck, Award } from "lucide-react";
import { StatsCard } from "../components/StatsCard/StatsCard";

export const Analytics: React.FC = () => {
  const { showToast } = useNotifications();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState("Daily"); // 'Daily', 'Weekly', 'Monthly'

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

  const derived = useMemo(() => {
    return analyticsService.deriveAnalytics(history);
  }, [history]);

  // Derived Trend Chart coordinates
  const trendData = useMemo(() => {
    const counts: { [key: string]: number } = {};
    history.forEach((item) => {
      if (!item.time) return;
      
      let key: string;
      const datePart = item.time.split(" ")[0]; // "2026-07-14"
      
      if (filterPeriod === "Daily") {
        key = datePart;
      } else if (filterPeriod === "Weekly") {
        // Simple day of week mapping
        const d = new Date(datePart);
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        key = dayNames[d.getDay()];
      } else {
        // Month name mapping
        const d = new Date(datePart);
        const monthNames = [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        key = monthNames[d.getMonth()];
      }

      counts[key] = (counts[key] || 0) + 1;
    });

    const result = Object.entries(counts).map(([name, count]) => ({
      name,
      count,
    }));

    if (filterPeriod === "Weekly") {
      // Re-order by week starting Sunday
      const weekOrder = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return result.sort((a, b) => weekOrder.indexOf(a.name) - weekOrder.indexOf(b.name));
    }
    
    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, [history, filterPeriod]);

  // Most Active Plates (frequency ranking list)
  const topPlates = useMemo(() => {
    const counts: { [key: string]: number } = {};
    history.forEach((item) => {
      const p = item.plate_number?.trim().toUpperCase();
      if (p && p !== "NO PLATE FOUND" && p !== "LOW QUALITY") {
        counts[p] = (counts[p] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .map(([plate, count]) => ({ plate, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [history]);

  // Compute confidence analytics dynamically from history
  const confidenceStats = useMemo(() => {
    const list = history
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

    if (list.length === 0) {
      return {
        hasData: false,
        average: 0,
        highest: 0,
        lowest: 0,
        trend: [] as { name: string; score: number }[],
      };
    }

    const average = Math.round((list.reduce((sum, val) => sum + val, 0) / list.length) * 100) / 100;
    const highest = Math.round(Math.max(...list) * 100) / 100;
    const lowest = Math.round(Math.min(...list) * 100) / 100;

    // Last 15 scans trend sequence mapping
    const trend = history
      .slice()
      .reverse()
      .map((item, idx) => {
        const c = item.confidence ?? item.detection_confidence ?? item.ocr_confidence ?? item.score ?? item.conf ?? null;
        if (c === undefined || c === null || isNaN(c)) return null;
        let percent = Number(c);
        if (percent > 0 && percent <= 1.0) {
          percent = percent * 100;
        }
        return {
          name: `Scan #${idx + 1}`,
          score: Math.round(percent * 100) / 100,
        };
      })
      .filter((d): d is { name: string; score: number } => d !== null)
      .slice(-15);

    return {
      hasData: true,
      average,
      highest,
      lowest,
      trend,
    };
  }, [history]);

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
              Analytics API server connection is offline. Verify uvicorn server processes.
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

  const PIE_COLORS = ["#18B8FF", "#4F7CFF", "#00E5FF", "#a855f7", "#e11d48"];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-wide text-white font-sans text-glow">
          Traffic Analytics
        </h1>
        <p className="text-xs text-slate-400">Database History Metrics & Analytical Charts</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonLoader type="chart" />
          <SkeletonLoader type="chart" />
          <SkeletonLoader type="card" />
          <SkeletonLoader type="card" />
        </div>
      ) : history.length === 0 ? (
        <GlassCard className="text-center py-20 flex flex-col items-center gap-4">
          <div className="p-4 bg-white/5 border border-white/5 rounded-full w-fit text-slate-500">
            <FileBarChart className="w-8 h-8 text-slate-400" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-200">Insufficient Data Records</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-[200px] mx-auto leading-normal">
              Need active plate recognition history entries to generate analytical grids.
            </p>
          </div>
        </GlassCard>
      ) : (
        <>
          {/* Analytical Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Scans Trend Chart */}
            <ChartCard
              title="Recognition Volume Over Time"
              subtitle="Log count distributions"
              filterOption={filterPeriod}
              onFilterChange={setFilterPeriod}
            >
              {trendData.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                  Awaiting timeline tracking data
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.03)" />
                    <XAxis
                      dataKey="name"
                      stroke="#475569"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#475569"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#111B2F",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#18B8FF"
                      strokeWidth={2}
                      dot={{ fill: "#00E5FF", strokeWidth: 1 }}
                      activeDot={{ r: 6, stroke: "#18B8FF" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            {/* Peak traffic hours histogram */}
            <ChartCard
              title="Hourly Traffic Load"
              subtitle="Sum of historical scans categorized by hour"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={derived.hourlyTraffic}>
                  <XAxis
                    dataKey="hour"
                    stroke="#475569"
                    fontSize={9}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#475569"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#111B2F",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="count" fill="#4F7CFF" radius={[4, 4, 0, 0]}>
                    {derived.hourlyTraffic.map((entry, index) => {
                      // Highlight peak hour
                      const isPeak = entry.hour.startsWith(derived.peakHour.split(":")[0]);
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={isPeak ? "#00E5FF" : "#4F7CFF"}
                          className={isPeak ? "shadow-glow-accent" : ""}
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Vehicle classes pie share */}
            <div className="lg:col-span-2">
              <GlassCard className="h-full flex flex-col justify-between" hoverEffect={false}>
                <h4 className="text-base font-semibold text-slate-100 border-b border-white/5 pb-3 mb-4">
                  Classification distribution share
                </h4>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Left Side: Pie */}
                  <div className="w-full sm:w-1/2 h-[220px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={derived.vehicleTypes.filter((v) => v.value > 0)}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {derived.vehicleTypes
                            .filter((v) => v.value > 0)
                            .map((_, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={PIE_COLORS[index % PIE_COLORS.length]}
                              />
                            ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: "#111B2F",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: "12px",
                            fontSize: "12px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Right Side: Legend Metrics */}
                  <div className="w-full sm:w-1/2 space-y-3.5">
                    {derived.vehicleTypes
                      .filter((v) => v.value > 0)
                      .map((item, index) => {
                        const total = derived.uniqueVehicles || 1;
                        const pct = ((item.value / total) * 100).toFixed(1);
                        return (
                          <div key={item.name} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 font-semibold">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                              />
                              <span className="text-slate-200">{item.name}</span>
                            </div>
                            <div className="font-mono text-slate-400">
                              <span className="text-slate-200 font-bold">{item.value}</span>
                              <span className="text-[10px] ml-1">({pct}%)</span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Top Frequent Scans List */}
            <div>
              <GlassCard className="h-full flex flex-col justify-between" hoverEffect={false}>
                <h4 className="text-base font-semibold text-slate-100 border-b border-white/5 pb-3 mb-4">
                  Recurrent vehicle scans
                </h4>

                <div className="space-y-4">
                  {topPlates.length === 0 ? (
                    <div className="py-16 text-center text-slate-500 text-xs font-semibold">
                      Insufficient repeat vehicle logs
                    </div>
                  ) : (
                    topPlates.map((item, index) => (
                      <div
                        key={item.plate}
                        className="flex justify-between items-center p-3.5 bg-white/5 border border-white/5 rounded-xl font-mono text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-slate-500">#{index + 1}</span>
                          <span className="text-sm font-bold text-white tracking-widest">{item.plate}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-brand-accent font-bold">{item.count}</span>
                          <span className="text-[9px] text-slate-500 font-sans block">Scans logged</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </GlassCard>
            </div>
          </div>

          {/* Model Detection Certainty Telemetry */}
          {confidenceStats.hasData && (
            <div className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <StatsCard
                  title="Average Confidence"
                  value={`${confidenceStats.average}%`}
                  icon={ShieldCheck}
                  subtext="Model prediction mean"
                  glowColor="primary"
                />
                <StatsCard
                  title="Highest Confidence"
                  value={`${confidenceStats.highest}%`}
                  icon={Award}
                  subtext="Peak extraction certainty"
                  glowColor="accent"
                />
                <StatsCard
                  title="Lowest Confidence"
                  value={`${confidenceStats.lowest}%`}
                  icon={AlertTriangle}
                  subtext="Minimum score recorded"
                  glowColor="secondary"
                />
              </div>

              <div className="grid grid-cols-1 gap-6">
                <ChartCard
                  title="Confidence Timeline Progression"
                  subtitle="OCR precision trend over recent scan sequence"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={confidenceStats.trend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.03)" />
                      <XAxis
                        dataKey="name"
                        stroke="#475569"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#475569"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        domain={[0, 100]}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "#111B2F",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: "12px",
                          fontSize: "12px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#00E5FF"
                        strokeWidth={2}
                        dot={{ fill: "#18B8FF", strokeWidth: 1 }}
                        activeDot={{ r: 6, stroke: "#00E5FF" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
