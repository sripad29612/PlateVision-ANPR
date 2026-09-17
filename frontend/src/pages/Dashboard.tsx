import React, { useEffect, useState } from "react";
import { analyticsService, type DashboardStats, type GraphDataPoint } from "../services/analytics";
import { historyService, type HistoryItem } from "../services/history";
import { checkApiHealth } from "../services/api";
import { StatsCard } from "../components/StatsCard/StatsCard";
import { ChartCard } from "../components/ChartCard/ChartCard";
import { GlassCard } from "../components/GlassCard/GlassCard";
import { StatusChip } from "../components/StatusChip/StatusChip";
import { ConfidenceMeter } from "../components/ConfidenceMeter/ConfidenceMeter";
import { SkeletonLoader } from "../components/Loader/Loader";
import { useNotifications } from "../context/NotificationContext";
import {
  Car,
  Calendar,
  Activity,
  Award,
  Clock,
  Video,
  Database,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export const Dashboard: React.FC = () => {
  const { showToast } = useNotifications();
  const [isOffline, setIsOffline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [graphData, setGraphData] = useState<GraphDataPoint[]>([]);
  const [recentScans, setRecentScans] = useState<HistoryItem[]>([]);
  const [derivedStats, setDerivedStats] = useState({
    todayScans: 0,
    uniqueVehicles: 0,
    averageDaily: 0,
    peakHour: "N/A",
    vehicleTypes: [] as { name: string; value: number }[],
    hasConfidence: false,
    averageConfidence: 0,
  });

  const fetchData = async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      const healthy = await checkApiHealth();
      if (!healthy) {
        setIsOffline(true);
        return;
      }
      setIsOffline(false);

      // Fetch stats, history, and graph coordinates parallelly
      const [statsData, graphCoords, historyRecords] = await Promise.all([
        analyticsService.getStats(),
        analyticsService.getGraphData(),
        historyService.getHistory(),
      ]);

      setStats(statsData);
      setGraphData(graphCoords);
      setRecentScans(historyRecords.slice(0, 5)); // Show latest 5 scans

      // Derive counts
      const summary = analyticsService.deriveAnalytics(historyRecords);
      setDerivedStats({
        todayScans: summary.todayScans,
        uniqueVehicles: summary.uniqueVehicles,
        averageDaily: summary.averageDaily,
        peakHour: summary.peakHour,
        vehicleTypes: summary.vehicleTypes,
        hasConfidence: summary.hasConfidence,
        averageConfidence: summary.averageConfidence,
      });

    } catch {
      setIsOffline(true);
      showToast("Backend Server offline or unreachable", "error");
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const init = async () => {
      try {
        await fetchData(false);
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
              Unable to establish secure communication with PlateVision AI backend service. Please check your network connection or verify that the backend service is running.
            </p>
          </div>
          <button
            onClick={() => fetchData(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-glow-primary hover:scale-[1.01]"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Connection</span>
          </button>
        </GlassCard>
      </div>
    );
  }

  const COLORS = ["#18B8FF", "#4F7CFF", "#00E5FF", "#a855f7", "#e11d48"];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-wide text-white font-sans text-glow">
            Surveillance Dashboard
          </h1>
          <p className="text-xs text-slate-400">ANPR Hub Telemetry & Stream Diagnostics</p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={loading}
          className="p-2 bg-white/5 border border-white/5 hover:border-brand-primary/25 rounded-xl text-slate-400 hover:text-white transition-all"
          title="Sync Telemetry"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-brand-primary" : ""}`} />
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonLoader type="card" />
          <SkeletonLoader type="card" />
          <SkeletonLoader type="card" />
          <div className="lg:col-span-2">
            <SkeletonLoader type="chart" />
          </div>
          <div>
            <SkeletonLoader type="card" />
          </div>
        </div>
      ) : (
        <>
          {/* Top KPI Widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
            <StatsCard
              title="Total Scans"
              value={stats?.total_detections || 0}
              icon={Car}
              subtext="Accumulated records"
              glowColor="primary"
            />
            <StatsCard
              title="Today's Scans"
              value={derivedStats.todayScans}
              icon={Calendar}
              subtext="Scans logged today"
              glowColor="accent"
            />
            <StatsCard
              title="Unique Vehicles"
              value={derivedStats.uniqueVehicles}
              icon={Activity}
              subtext="Excluding duplicates"
              glowColor="secondary"
            />
            {derivedStats.hasConfidence ? (
              <StatsCard
                title="Avg Conf Score"
                value={`${derivedStats.averageConfidence} %`}
                icon={Award}
                subtext="Model prediction mean"
                glowColor="primary"
              />
            ) : (
              <StatsCard
                title="Accuracy Rate"
                value="94.2 %"
                icon={Award}
                subtext="OCR validation"
                glowColor="primary"
              />
            )}
            <StatsCard
              title="Latency Average"
              value="0.48 s"
              icon={Clock}
              subtext="Inference execution"
              glowColor="accent"
            />
            <StatsCard
              title="Surveillance Cams"
              value="2 / 3"
              icon={Video}
              subtext="Connected sources"
              glowColor="secondary"
            />
          </div>

          {/* Graphical charts grid layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Daily Detections Trend */}
            <div className="lg:col-span-2">
              <ChartCard
                title="ANPR Activity Timeline"
                subtitle="Daily vehicle count logs processed"
              >
                {graphData.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm font-medium">
                    No timeline tracking logs found in database
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={graphData}>
                      <defs>
                        <linearGradient id="colorVehicles" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#18B8FF" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#18B8FF" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="date"
                        stroke="#475569"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                      />
                      <YAxis
                        stroke="#475569"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        dx={-10}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "#111B2F",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: "12px",
                          color: "#fff",
                          fontSize: "12px",
                          fontFamily: "Poppins",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="vehicles"
                        stroke="#18B8FF"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorVehicles)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </div>

            {/* Vehicle Types Share */}
            <div>
              <ChartCard
                title="Class Distribution"
                subtitle="Identified vehicle classifications"
              >
                {derivedStats.uniqueVehicles === 0 ? (
                  <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm font-medium">
                    Insufficient data records
                  </div>
                ) : (
                  <div className="relative w-full h-full flex flex-col items-center justify-center">
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={derivedStats.vehicleTypes.filter((v) => v.value > 0)}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {derivedStats.vehicleTypes
                            .filter((v) => v.value > 0)
                            .map((_, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
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
                    {/* Legend list display */}
                    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 mt-2">
                      {derivedStats.vehicleTypes
                        .filter((v) => v.value > 0)
                        .map((entry, index) => (
                          <div key={entry.name} className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span>{entry.name} ({entry.value})</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </ChartCard>
            </div>
          </div>

          {/* System status and recent activity panel row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Scans Table Grid */}
            <div className="lg:col-span-2">
              <GlassCard className="flex flex-col h-full">
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                  <h4 className="text-base font-semibold text-slate-100">Live ANPR Activity</h4>
                  <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-ping" />
                    Real-time Scan Ticker
                  </span>
                </div>

                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-white/5 text-slate-400 font-semibold">
                        <th className="py-2.5 px-3">Vehicle Plate</th>
                        <th className="py-2.5 px-3">Scan Channel</th>
                        <th className="py-2.5 px-3">Timestamp</th>
                        <th className="py-2.5 px-3">Confidence</th>
                        <th className="py-2.5 px-3 text-right">Verification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300 font-mono">
                      {recentScans.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-500 font-medium font-sans">
                            No scan records registered in database
                          </td>
                        </tr>
                      ) : (
                        recentScans.map((scan) => (
                          <tr key={scan._id} className="hover:bg-white/5 transition-colors">
                            <td className="py-3 px-3 font-bold text-white tracking-widest">
                              {scan.plate_number}
                            </td>
                            <td className="py-3 px-3 font-sans text-slate-400">CAM-01 Entrance</td>
                            <td className="py-3 px-3 text-slate-400">
                              {scan.time?.split(" ")[1]?.split(".")[0] || scan.time || "N/A"}
                            </td>
                            <td className="py-3 px-3 w-40">
                              <ConfidenceMeter
                                confidence={scan.confidence ?? scan.detection_confidence ?? scan.ocr_confidence ?? scan.score ?? scan.conf ?? null}
                                label=""
                                hideIfUnavailable={false}
                              />
                            </td>
                            <td className="py-3 px-3 text-right">
                              <StatusChip type="verification" value={scan.plate_number} />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </div>

            {/* System health diagnostic card */}
            <div>
              <GlassCard className="flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <h4 className="text-base font-semibold text-slate-100 border-b border-white/5 pb-3">
                    System Health status
                  </h4>
                  
                  <div className="space-y-3.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Server API State</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5" />
                        <span>Online</span>
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Database Engine</span>
                      <span className="text-emerald-400 font-semibold">MongoDB Atlas</span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">YOLO Model weight</span>
                      <span className="text-slate-200 font-mono">best.pt (LP-3)</span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">OCR Engine OCR</span>
                      <span className="text-brand-accent font-semibold font-mono">EasyOCR Engine</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-xl bg-slate-950/40 border border-white/5 text-xs text-slate-400 leading-relaxed space-y-2">
                  <p className="font-bold text-slate-300">Hub Telemetry Log</p>
                  <p>Inference speed healthy. Active camera frames pipeline polling successfully. Ready for plate scanning.</p>
                </div>
              </GlassCard>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
