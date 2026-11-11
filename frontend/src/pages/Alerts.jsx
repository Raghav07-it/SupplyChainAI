import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Check,
  Phone,
  Mail,
  Anchor,
  Compass,
  Headphones,
  SlidersHorizontal,
  Eye,
  EyeOff,
  CheckCheck,
  Globe,
  Search,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  Info,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  getAlerts,
  acknowledgeAlert,
  acknowledgeAllAlerts,
  toggleAlertRead,
} from "../api/alerts";
import { getSettings, updateSettings } from "../api/settings";
import EmptyState from "../components/ui/EmptyState";
import LoadingSpinner from "../components/ui/LoadingSpinner";

export default function Alerts() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State
  const [activeTab, setActiveTab] = useState("my-routes"); // 'my-routes' | 'all' | 'resolved'
  const [severityFilter, setSeverityFilter] = useState("all"); // 'all' | 'critical' | 'high' | 'medium' | 'low'
  const [readFilter, setReadFilter] = useState("all"); // 'all' | 'unread' | 'read'
  const [searchQuery, setSearchQuery] = useState("");
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load alerts and user settings
  const loadAlertData = useCallback(async () => {
    try {
      setError("");
      const [alertsRes, userSettings] = await Promise.all([
        getAlerts({
          view: activeTab,
          severity: severityFilter !== "all" ? severityFilter : null,
          search: searchQuery,
        }),
        getSettings().catch(() => null),
      ]);

      setAlerts(Array.isArray(alertsRes) ? alertsRes : []);
      if (userSettings && typeof userSettings.sms_alerts === "boolean") {
        setSmsAlerts(userSettings.sms_alerts);
      }
    } catch (err) {
      console.error("Failed to load alerts:", err);
      setError("Unable to retrieve real-time alerts. Showing cached operational data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, severityFilter, searchQuery]);

  useEffect(() => {
    loadAlertData();
  }, [loadAlertData]);

  // Client-side filtering for read/unread filter
  const displayedAlerts = alerts.filter((a) => {
    if (readFilter === "unread") return !a.is_read;
    if (readFilter === "read") return a.is_read;
    return true;
  });

  // Summary counts
  const criticalCount = alerts.filter(
    (a) => (a.severity || "").toLowerCase() === "critical"
  ).length;

  const highCount = alerts.filter(
    (a) => (a.severity || "").toLowerCase() === "high"
  ).length;

  const mediumCount = alerts.filter(
    (a) =>
      (a.severity || "").toLowerCase() === "medium" ||
      (a.severity || "").toLowerCase() === "warning"
  ).length;

  const unreadCount = alerts.filter((a) => !a.is_read).length;

  // Actions
  const handleAcknowledgeAll = async () => {
    try {
      await acknowledgeAllAlerts();
      setAlerts((prev) =>
        prev.map((a) => ({ ...a, is_acknowledged: true, is_read: true }))
      );
    } catch (err) {
      console.error("Failed to acknowledge all alerts:", err);
    }
  };

  const handleAcknowledgeSingle = async (alertId) => {
    setActionLoadingId(alertId);
    try {
      await acknowledgeAlert(alertId);
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === alertId ? { ...a, is_acknowledged: true, is_read: true } : a
        )
      );
    } catch (err) {
      console.error("Failed to acknowledge alert:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleRead = async (alertId) => {
    setActionLoadingId(alertId);
    try {
      const res = await toggleAlertRead(alertId);
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === alertId ? { ...a, is_read: res.is_read } : a
        )
      );
    } catch (err) {
      console.error("Failed to toggle read state:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSmsToggle = async () => {
    const nextVal = !smsAlerts;
    setSmsAlerts(nextVal);
    try {
      await updateSettings({ sms_alerts: nextVal });
    } catch (err) {
      console.warn("Failed to persist SMS toggle:", err);
    }
  };

  const handleManualRefresh = () => {
    setRefreshing(true);
    loadAlertData();
  };

  // Derive unique active ports from alerts for the sidebar preview
  const activePortsWithAlerts = Array.from(
    new Map(
      alerts
        .filter((a) => a.port_name || a.port)
        .map((a) => [
          a.port_name || a.port,
          {
            name: a.port_name || a.port,
            country: a.country || "",
            severity: a.severity || "medium",
            delay: a.delay_hours || 0,
          },
        ])
    ).values()
  ).slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-cyan)] flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-cyan)] animate-pulse" />
              Live Operational Advisory • Verified Corridor Radar
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-high-contrast)] tracking-tight">
            Route & Port Alerts
          </h1>
          <p className="text-base text-[var(--text-secondary)] mt-1.5 max-w-2xl leading-relaxed">
            Real-time warnings, berthing strikes, and weather disruptions directly affecting shipping corridors where your cargo is moving.
          </p>
        </div>

        {/* Top Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/intelligence"
            className="cs-btn cs-btn-secondary text-sm flex items-center gap-2"
          >
            <Globe size={16} />
            <span>Open Fleet Map</span>
          </Link>
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="cs-btn cs-btn-secondary text-sm flex items-center gap-2"
            title="Refresh alerts"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            <span>{refreshing ? "Syncing..." : "Sync Feeds"}</span>
          </button>
          <button
            type="button"
            onClick={handleAcknowledgeAll}
            disabled={alerts.length === 0 || unreadCount === 0}
            className="cs-btn cs-btn-primary text-sm font-semibold disabled:opacity-50 flex items-center gap-2 shadow-lg"
          >
            <CheckCheck size={16} />
            <span>Acknowledge All</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs, Search & Summary Counts */}
      <div className="flex flex-col gap-4 bg-[var(--surface-base)] p-4 rounded-xl border border-[var(--border-color)]">
        {/* Top Row: Primary Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab("my-routes")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "my-routes"
                  ? "bg-[var(--accent-primary)] text-white shadow-md shadow-indigo-500/20"
                  : "bg-[var(--surface-overlay)] text-[var(--text-secondary)] hover:text-white"
              }`}
            >
              My Corridor Routes
            </button>
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "all"
                  ? "bg-[var(--accent-primary)] text-white shadow-md shadow-indigo-500/20"
                  : "bg-[var(--surface-overlay)] text-[var(--text-secondary)] hover:text-white"
              }`}
            >
              All Global Advisories
            </button>
            <button
              onClick={() => setActiveTab("resolved")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "resolved"
                  ? "bg-[var(--accent-primary)] text-white shadow-md shadow-indigo-500/20"
                  : "bg-[var(--surface-overlay)] text-[var(--text-secondary)] hover:text-white"
              }`}
            >
              Acknowledged / Audit Log
            </button>
          </div>

          {/* Severity & Unread Count Pills */}
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            {criticalCount > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                {criticalCount} Critical
              </span>
            )}
            {highCount > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                {highCount} High
              </span>
            )}
            <span className="px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              {unreadCount} Unread
            </span>
          </div>
        </div>

        {/* Bottom Row: Granular Filters & Instant Search */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--border-color)]">
          <div className="flex flex-wrap items-center gap-2">
            {/* Severity Filter Dropdown */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="text-xs font-semibold py-1.5 px-3 rounded-lg bg-[var(--surface-overlay)] text-[var(--text-high-contrast)] border border-[var(--border-color)] focus:outline-none"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical Severity</option>
              <option value="high">High Severity</option>
              <option value="medium">Medium Severity</option>
              <option value="low">Low Severity</option>
            </select>

            {/* Read / Unread Status Dropdown */}
            <select
              value={readFilter}
              onChange={(e) => setReadFilter(e.target.value)}
              className="text-xs font-semibold py-1.5 px-3 rounded-lg bg-[var(--surface-overlay)] text-[var(--text-high-contrast)] border border-[var(--border-color)] focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="unread">Unread Only</option>
              <option value="read">Marked as Read</option>
            </select>
          </div>

          {/* Search Input Box */}
          <div className="relative min-w-[240px] flex-1 sm:flex-initial">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
            />
            <input
              type="text"
              placeholder="Search corridor, port, or alert…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-1.5 rounded-lg bg-[var(--surface-overlay)] text-[var(--text-high-contrast)] placeholder-[var(--text-secondary)] border border-[var(--border-color)] focus:outline-none focus:border-[var(--accent-primary)]"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
          <Info size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Alert Cards (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {loading ? (
            <div className="py-16 flex justify-center cs-card">
              <LoadingSpinner message="Checking real-time corridor telemetry..." />
            </div>
          ) : displayedAlerts.length === 0 ? (
            activeTab === "resolved" ? (
              <div className="cs-card p-12 text-center space-y-2">
                <CheckCircle2 size={42} className="mx-auto text-[var(--status-success)] mb-2" />
                <h3 className="text-lg font-bold text-[var(--text-high-contrast)]">
                  No Acknowledged Alerts in Log
                </h3>
                <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
                  When you acknowledge active corridor warnings, they move to this audit log for operational record keeping.
                </p>
              </div>
            ) : (
              <EmptyState
                icon={CheckCircle2}
                title="Corridors Operating Normally"
                description={
                  searchQuery
                    ? "No alerts matched your search query. Try clearing filters."
                    : activeTab === "my-routes"
                    ? "All shipping lanes associated with your active cargo shipments are clear without reported delays."
                    : "There are currently no active maritime disruptions reported across tracked global ports."
                }
                actionLabel={activeTab === "my-routes" ? "View My Shipments" : undefined}
                onAction={activeTab === "my-routes" ? () => navigate("/my-shipments") : undefined}
              />
            )
          ) : (
            displayedAlerts.map((alert) => {
              const rawSev = (alert.severity || "medium").toLowerCase();
              const isCritical = rawSev === "critical";
              const isHigh = rawSev === "high" || rawSev === "critical";
              const isNotice = rawSev === "medium" || rawSev === "warning";

              const borderAccent = isCritical
                ? "border-l-4 border-l-red-500"
                : isHigh
                ? "border-l-4 border-l-orange-500"
                : isNotice
                ? "border-l-4 border-l-amber-500"
                : "border-l-4 border-l-emerald-500";

              const badgeClass = isCritical
                ? "cs-pill cs-pill-red"
                : isHigh
                ? "cs-pill cs-pill-amber"
                : "cs-pill cs-pill-cyan";

              const title =
                alert.title ||
                alert.headline ||
                `${alert.category || "Maritime"} Alert: ${alert.port || "Corridor"}`;

              const description =
                alert.description ||
                (alert.delay_hours
                  ? `Estimated delay impact: ~${alert.delay_hours} hours.`
                  : "Active corridor monitoring in effect.");

              const location =
                alert.port || alert.location || alert.port_name || "Ocean Transit Corridor";
              const category = alert.category || "Advisory";

              return (
                <div
                  key={alert.id}
                  className={`cs-card p-6 ${borderAccent} space-y-4 transition-all ${
                    alert.is_read
                      ? "opacity-90"
                      : "shadow-[0_0_20px_rgba(99,102,241,0.12)] border-[var(--border-active)]"
                  }`}
                >
                  {/* Card Meta Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={badgeClass}>
                        ● {isCritical ? "Critical Alert" : isHigh ? "High Alert" : isNotice ? "Notice" : "Advisory"} — {category}
                      </span>
                      {alert.shipment_ref && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/15 text-[var(--accent-primary-light)] border border-indigo-500/30">
                          Affects Shipment #{alert.shipment_ref}
                        </span>
                      )}
                      {alert.is_acknowledged && (
                        <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/15 text-[var(--status-success)] border border-emerald-500/30 flex items-center gap-1 font-semibold">
                          <Check size={12} /> Acknowledged
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5 font-medium">
                      <Clock size={13} />
                      {alert.started_at ? new Date(alert.started_at).toLocaleDateString() : "Active Now"}
                    </span>
                  </div>

                  {/* Location & Title */}
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-[var(--accent-cyan)] mb-1">
                      <Anchor size={15} />
                      <span>{location}</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-high-contrast)] leading-snug tracking-tight">
                      {title}
                    </h2>
                    <p className="text-base text-[var(--text-body)] mt-2 leading-relaxed">
                      {description}
                    </p>
                  </div>

                  {/* Recommended Action Box */}
                  {(alert.recommended_action || alert.whatToDo || alert.delay_hours > 0) && (
                    <div className="bg-[var(--surface-base)] border border-[var(--border-color)] rounded-xl p-4 text-sm space-y-1.5">
                      <div className="font-bold text-[var(--text-high-contrast)] flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-[var(--status-success)]" />
                        <span>Recommended Operational Response</span>
                      </div>
                      <p className="text-[var(--text-secondary)] pl-6 leading-relaxed">
                        {alert.recommended_action ||
                          alert.whatToDo ||
                          `Coordinate with your carrier dispatch regarding the estimated ${alert.delay_hours}h berthing queue.`}
                      </p>
                    </div>
                  )}

                  {/* Bottom Action Footer */}
                  <div className="pt-3 border-t border-[var(--border-color)] flex flex-wrap items-center justify-between gap-3 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to="/intelligence"
                        className="cs-btn cs-btn-secondary py-1.5 px-3 text-xs"
                      >
                        Inspect on World Map
                      </Link>

                      {/* Interactive Read/Unread Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleRead(alert.id)}
                        disabled={actionLoadingId === alert.id}
                        className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-white hover:bg-[var(--surface-overlay)] transition-colors flex items-center gap-1.5 text-xs font-medium"
                      >
                        {alert.is_read ? <EyeOff size={13} /> : <Eye size={13} />}
                        <span>{alert.is_read ? "Mark Unread" : "Mark Read"}</span>
                      </button>

                      {/* Interactive Acknowledge Button */}
                      {!alert.is_acknowledged && (
                        <button
                          type="button"
                          onClick={() => handleAcknowledgeSingle(alert.id)}
                          disabled={actionLoadingId === alert.id}
                          className="px-3 py-1.5 rounded-lg bg-[rgba(99,102,241,0.18)] text-[var(--accent-primary-light)] border border-[rgba(99,102,241,0.35)] hover:bg-[rgba(99,102,241,0.28)] transition-colors flex items-center gap-1.5 text-xs font-semibold"
                        >
                          <Check size={13} />
                          <span>Acknowledge</span>
                        </button>
                      )}
                    </div>

                    <div className="text-xs text-[var(--text-secondary)] font-medium">
                      Source: <span className="text-[var(--text-high-contrast)]">{alert.source || "Global Maritime Radar"}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Widgets (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Card 1: Alert Notification Channels */}
          <div className="cs-card p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[var(--text-high-contrast)] flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-[var(--accent-primary-light)]" />
                Alert Notification Channels
              </h3>
              <Link
                to="/settings"
                className="text-xs text-[var(--accent-cyan)] hover:underline font-semibold"
              >
                Configure
              </Link>
            </div>

            {/* Toggle */}
            <div className="pt-1">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-[var(--text-high-contrast)]">
                    Urgent SMS Telemetry
                  </span>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-snug">
                    Receive immediate text alerts for canal blockages and port strikes.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSmsToggle}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ml-3 ${
                    smsAlerts ? "bg-[var(--accent-primary)]" : "bg-[var(--surface-overlay)]"
                  }`}
                  aria-label="Toggle SMS alerts"
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                      smsAlerts ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Email Summaries */}
            <div className="pt-3 border-t border-[var(--border-color)]">
              <div className="text-xs text-[var(--text-secondary)] uppercase font-bold tracking-wider mb-1.5">
                Daily Corridor Digest Sent To:
              </div>
              <div className="flex items-center justify-between text-xs text-[var(--text-high-contrast)] bg-[var(--surface-base)] p-3 rounded-lg border border-[var(--border-color)]">
                <span className="flex items-center gap-2 truncate font-medium">
                  <Mail size={15} className="text-[var(--accent-cyan)] shrink-0" />
                  {user?.email || "operator@enterprise.com"}
                </span>
                <span className="text-xs text-[var(--status-success)] font-bold shrink-0">
                  Active
                </span>
              </div>
            </div>

            {/* Freight Concierge Hotline */}
            <div className="pt-3 border-t border-[var(--border-color)]">
              <div className="text-xs text-[var(--text-secondary)] uppercase font-bold tracking-wider mb-1.5">
                Trade Concierge Desk
              </div>
              <div className="flex items-center justify-between text-xs text-[var(--text-high-contrast)] bg-[var(--surface-base)] p-3 rounded-lg border border-[var(--border-color)]">
                <div className="flex items-center gap-2">
                  <Phone size={15} className="text-[var(--status-success)]" />
                  <span className="font-semibold">+31 10 798 2200</span>
                </div>
                <span className="text-xs text-[var(--text-secondary)]">24/7 Priority</span>
              </div>
            </div>
          </div>

          {/* Card 2: Active Disruption Hotspots */}
          <div className="cs-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[var(--text-high-contrast)] flex items-center gap-2">
                <ShieldAlert size={18} className="text-red-400" />
                Active Maritime Hotspots
              </h3>
              <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--status-success)] animate-pulse" />
                Live Radar
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              {activePortsWithAlerts.length > 0 ? (
                activePortsWithAlerts.map((p) => {
                  const isCrit = p.severity === "critical";
                  const isHi = p.severity === "high";

                  return (
                    <div
                      key={p.name}
                      className="flex items-center justify-between py-2 border-b border-[var(--border-color)] last:border-0"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            isCrit ? "bg-red-500 animate-pulse" : isHi ? "bg-orange-500" : "bg-amber-500"
                          }`}
                        />
                        <span className="font-semibold text-[var(--text-high-contrast)]">
                          {p.name}
                        </span>
                      </div>
                      <span className="font-bold text-red-400">
                        {p.delay > 0 ? `+${p.delay}h delay` : "Advisory"}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="text-[var(--text-secondary)] py-2 text-center">
                  All monitored global ports operating with optimal velocity.
                </div>
              )}
            </div>

            {/* Quick Interactive Map Launcher Banner */}
            <div className="mt-4 rounded-xl overflow-hidden border border-[#273B5E] bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-4 text-center space-y-2">
              <Compass size={28} className="mx-auto text-[var(--accent-cyan)]" />
              <div className="text-sm font-bold text-white">Interactive Fleet & Chokepoint Map</div>
              <p className="text-xs text-slate-300">
                100% free vector map powered by MapLibre & OpenFreeMap with zero API key requirement.
              </p>
              <Link
                to="/intelligence"
                className="cs-btn cs-btn-primary w-full py-2 text-xs font-semibold inline-flex items-center justify-center gap-2 mt-1"
              >
                <span>Launch World Map</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Card 3: Autonomous Rerouting Help */}
          <div className="cs-card p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--surface-overlay)] flex items-center justify-center text-[var(--accent-primary-light)] shrink-0 border border-[var(--border-color)]">
              <Headphones size={24} />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-sm font-bold text-[var(--text-high-contrast)]">
                Need Autonomous Reroute?
              </h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Our multi-agent routing engine analyzes live canal transit slots and calculates optimal Cape of Good Hope bypasses.
              </p>
              <button
                type="button"
                onClick={() => navigate("/rerouting")}
                className="text-xs text-[var(--accent-cyan)] font-bold hover:underline inline-flex items-center gap-1 pt-1"
              >
                <span>Request Automated Reroute</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
