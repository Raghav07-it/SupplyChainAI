import { useState, useEffect } from "react";
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
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  getMyRouteAlerts,
  getAllDisruptions,
  acknowledgeAlert,
  acknowledgeAllAlerts,
  toggleAlertRead,
} from "../api/alerts";
import { getSettings, updateSettings } from "../api/settings";
import { samplePortHealth } from "../data/sampleData";
import EmptyState from "../components/ui/EmptyState";
import LoadingSpinner from "../components/ui/LoadingSpinner";

export default function Alerts() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("my-routes"); // 'my-routes' | 'all' | 'resolved'
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [acknowledgedAll, setAcknowledgedAll] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [myRouteAlerts, setMyRouteAlerts] = useState([]);
  const [allDisruptions, setAllDisruptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load alerts and user settings
  useEffect(() => {
    let isMounted = true;
    Promise.all([
      getMyRouteAlerts().catch(() => []),
      getAllDisruptions().catch(() => []),
      getSettings().catch(() => null),
    ])
      .then(([myAlerts, disruptions, userSettings]) => {
        if (!isMounted) return;
        setMyRouteAlerts(Array.isArray(myAlerts) ? myAlerts : []);
        setAllDisruptions(Array.isArray(disruptions) ? disruptions : []);
        if (userSettings && typeof userSettings.sms_alerts === "boolean") {
          setSmsAlerts(userSettings.sms_alerts);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered views
  const activeMyRoutes = myRouteAlerts.filter((a) => !a.is_acknowledged);
  const resolvedMyRoutes = myRouteAlerts.filter((a) => a.is_acknowledged);

  const displayedAlerts =
    activeTab === "my-routes"
      ? activeMyRoutes
      : activeTab === "all"
      ? allDisruptions
      : resolvedMyRoutes;

  const highCount = displayedAlerts.filter(
    (a) => a.severity === "critical" || a.severity === "high" || a.type === "High Alert"
  ).length;

  const noticeCount = displayedAlerts.filter(
    (a) => a.severity === "medium" || a.severity === "warning" || a.type === "Notice"
  ).length;

  const infoCount = displayedAlerts.length - highCount - noticeCount;

  // Actions
  const handleAcknowledgeAll = async () => {
    try {
      await acknowledgeAllAlerts();
      setMyRouteAlerts((prev) =>
        prev.map((a) => ({ ...a, is_acknowledged: true, is_read: true }))
      );
      setAcknowledgedAll(true);
    } catch (err) {
      console.error("Failed to acknowledge all alerts:", err);
    }
  };

  const handleAcknowledgeSingle = async (alertId) => {
    setActionLoadingId(alertId);
    try {
      await acknowledgeAlert(alertId);
      setMyRouteAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, is_acknowledged: true, is_read: true } : a))
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
      setMyRouteAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, is_read: res.is_read } : a))
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

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent-cyan)] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--accent-cyan)] animate-pulse" />
              Operational Advisory • Live Route Feeds
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-high-contrast)]">
            Route & Port Alerts
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
            Warnings and weather updates that directly affect ports and shipping lanes where your cargo is moving.
          </p>
        </div>

        {/* Top Header Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === "my-routes" ? "all" : "my-routes")}
            className="cs-btn cs-btn-secondary text-xs"
          >
            <Filter size={14} />
            {activeTab === "my-routes" ? "Show Global Advisories" : "Filter My Lanes"}
          </button>
          <button
            type="button"
            onClick={handleAcknowledgeAll}
            disabled={activeMyRoutes.length === 0}
            className="cs-btn cs-btn-primary text-xs disabled:opacity-50"
          >
            <CheckCheck size={14} />
            {acknowledgedAll || activeMyRoutes.length === 0 ? "All Acknowledged" : "Acknowledge All"}
          </button>
        </div>
      </div>

      {/* Filter Tabs & Summary Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab("my-routes")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              activeTab === "my-routes"
                ? "bg-[var(--surface-overlay)] text-[var(--text-high-contrast)] border border-[var(--border-active)]"
                : "text-[var(--text-secondary)] hover:text-white"
            }`}
          >
            Only My Routes ({activeMyRoutes.length})
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              activeTab === "all"
                ? "bg-[var(--surface-overlay)] text-[var(--text-high-contrast)] border border-[var(--border-active)]"
                : "text-[var(--text-secondary)] hover:text-white"
            }`}
          >
            All Advisories ({allDisruptions.length})
          </button>
          <button
            onClick={() => setActiveTab("resolved")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              activeTab === "resolved"
                ? "bg-[var(--surface-overlay)] text-[var(--text-high-contrast)] border border-[var(--border-active)]"
                : "text-[var(--text-secondary)] hover:text-white"
            }`}
          >
            Acknowledged / Resolved ({resolvedMyRoutes.length})
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)] font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--status-critical)]" />
            {highCount} High
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--status-warning)]" />
            {noticeCount} Notice
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--status-success)]" />
            {Math.max(0, infoCount)} Normal
          </span>
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Alert Cards (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {loading ? (
            <div className="py-12 flex justify-center cs-card">
              <LoadingSpinner message="Checking active corridor alerts..." />
            </div>
          ) : activeTab === "resolved" && displayedAlerts.length === 0 ? (
            <div className="cs-card p-10 text-center">
              <CheckCircle2 size={36} className="mx-auto text-[var(--status-success)] mb-2" />
              <h3 className="font-semibold text-[var(--text-high-contrast)]">No resolved alerts in this period</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                When you acknowledge active corridor notices, they appear here for operational audit.
              </p>
            </div>
          ) : displayedAlerts.length === 0 ? (
            activeTab === "my-routes" ? (
              <EmptyState
                icon={CheckCircle2}
                title="No Active Corridor Alerts"
                description="All shipping lanes associated with your active cargo shipments are currently operating normally without delays."
                actionLabel="View My Shipments"
                onAction={() => navigate("/my-shipments")}
              />
            ) : (
              <EmptyState
                icon={CheckCircle2}
                title="No Global Port Advisories"
                description="There are currently no active maritime disruptions or severe port delays reported across tracked corridors."
              />
            )
          ) : (
            displayedAlerts.map((alert) => {
              const isHigh =
                alert.severity === "critical" || alert.severity === "high" || alert.type === "High Alert";
              const isNotice =
                alert.severity === "medium" || alert.severity === "warning" || alert.type === "Notice";

              const borderAccent = isHigh
                ? "border-l-4 border-l-[var(--status-critical)]"
                : isNotice
                ? "border-l-4 border-l-[var(--status-warning)]"
                : "border-l-4 border-l-[var(--status-success)]";

              const badgeClass = isHigh
                ? "cs-pill cs-pill-red"
                : isNotice
                ? "cs-pill cs-pill-amber"
                : "cs-pill cs-pill-green";

              const title = alert.title || alert.description || "Port Advisory";
              const description =
                alert.description ||
                (alert.delay_hours ? `Estimated delay impact: ~${alert.delay_hours} hours.` : "Monitoring route conditions.");
              const location = alert.port || alert.location || "Ocean Transit Corridor";
              const category = alert.category || alert.disruption_type || "Advisory";

              return (
                <div
                  key={alert.id}
                  className={`cs-card p-5 ${borderAccent} space-y-4 ${
                    alert.is_read ? "opacity-85" : "shadow-[0_0_15px_rgba(99,102,241,0.08)]"
                  }`}
                >
                  {/* Card Meta Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={badgeClass}>
                        ● {isHigh ? "High Alert" : isNotice ? "Notice" : "Advisory"} — {category}
                      </span>
                      {alert.shipment_ref && (
                        <span className="text-[11px] font-semibold text-[var(--accent-primary-light)]">
                          Affects Shipment #{alert.shipment_ref}
                        </span>
                      )}
                      {alert.is_acknowledged && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[rgba(16,185,129,0.15)] text-[var(--status-success)] border border-[rgba(16,185,129,0.3)] flex items-center gap-1 font-semibold">
                          <Check size={11} /> Acknowledged
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[var(--text-dim)] flex items-center gap-1">
                      <Clock size={12} />
                      {alert.updatedAgo || "Active"}
                    </span>
                  </div>

                  {/* Location & Title */}
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-cyan)] mb-1">
                      <Anchor size={14} />
                      <span>{location}</span>
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-[var(--text-high-contrast)] leading-snug">
                      {title}
                    </h2>
                    <p className="text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                      {description}
                    </p>
                  </div>

                  {/* What You Should Do Box */}
                  {(alert.whatToDo || alert.delay_hours) && (
                    <div className="bg-[var(--surface-base)] border border-[var(--border-color)] rounded-lg p-3 text-xs space-y-1">
                      <div className="font-semibold text-[var(--text-high-contrast)] flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-[var(--status-success)]" />
                        Recommended action
                      </div>
                      <p className="text-[var(--text-secondary)] pl-5 leading-relaxed">
                        {alert.whatToDo ||
                          `Coordinate with your carrier dispatch regarding the estimated ${alert.delay_hours}h berthing queue.`}
                      </p>
                    </div>
                  )}

                  {/* Bottom Action Footer */}
                  <div className="pt-2 border-t border-[var(--border-color)] flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <Link
                        to="/my-shipments"
                        className="cs-btn cs-btn-secondary py-1 px-3 text-xs"
                      >
                        View Active Shipments
                      </Link>

                      {/* Interactive Read/Unread Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleRead(alert.id)}
                        disabled={actionLoadingId === alert.id}
                        className="px-2.5 py-1 rounded border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-white hover:bg-[var(--surface-overlay)] transition-colors flex items-center gap-1 text-[11px]"
                      >
                        {alert.is_read ? <EyeOff size={12} /> : <Eye size={12} />}
                        <span>{alert.is_read ? "Mark Unread" : "Mark Read"}</span>
                      </button>

                      {/* Interactive Acknowledge */}
                      {!alert.is_acknowledged && (
                        <button
                          type="button"
                          onClick={() => handleAcknowledgeSingle(alert.id)}
                          disabled={actionLoadingId === alert.id}
                          className="px-2.5 py-1 rounded bg-[rgba(99,102,241,0.15)] text-[var(--accent-primary-light)] border border-[rgba(99,102,241,0.3)] hover:bg-[rgba(99,102,241,0.25)] transition-colors flex items-center gap-1 text-[11px] font-medium"
                        >
                          <Check size={12} />
                          <span>Acknowledge</span>
                        </button>
                      )}
                    </div>
                    <span className="text-[11px] text-[var(--text-dim)]">
                      {alert.status ? `Status: ${alert.status}` : "Corridor active"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Widgets (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Card 1: Alert Preferences */}
          <div className="cs-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--text-high-contrast)] flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-[var(--accent-primary-light)]" />
                Alert Preferences
              </h3>
              <Link
                to="/settings"
                className="text-[11px] text-[var(--accent-cyan)] hover:underline font-medium"
              >
                Configure
              </Link>
            </div>

            {/* Toggle */}
            <div className="pt-1">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-[var(--text-high-contrast)]">
                    Urgent SMS Alerts
                  </span>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-tight">
                    Receive immediate text alerts for vessel re-routings and customs holds.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSmsToggle}
                  className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ml-3 ${
                    smsAlerts ? "bg-[var(--accent-primary)]" : "bg-[var(--surface-overlay)]"
                  }`}
                  aria-label="Toggle SMS alerts"
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      smsAlerts ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Email Summaries */}
            <div className="pt-2 border-t border-[var(--border-color)]">
              <div className="text-[11px] text-[var(--text-dim)] uppercase font-semibold">
                Plain English summaries sent to:
              </div>
              <div className="flex items-center justify-between mt-1 text-xs text-[var(--text-high-contrast)] bg-[var(--surface-base)] p-2 rounded border border-[var(--border-color)]">
                <span className="flex items-center gap-1.5 truncate">
                  <Mail size={13} className="text-[var(--text-secondary)] shrink-0" />
                  {user?.email || "user@example.com"}
                </span>
                <span className="text-[11px] text-[var(--accent-cyan)] shrink-0">
                  Verified
                </span>
              </div>
              <p className="text-[10px] text-[var(--text-dim)] mt-1">
                Digest sent daily whenever your active cargo routes register updates.
              </p>
            </div>

            {/* Freight Forwarder Liaison */}
            <div className="pt-2 border-t border-[var(--border-color)]">
              <div className="text-[11px] text-[var(--text-dim)] uppercase font-semibold">
                Freight Forwarder Liaison
              </div>
              <div className="flex items-center justify-between mt-1 text-xs text-[var(--text-high-contrast)] bg-[var(--surface-base)] p-2 rounded border border-[var(--border-color)]">
                <div className="flex items-center gap-1.5">
                  <Phone size={13} className="text-[var(--status-success)]" />
                  <span>+31 10 798 2200</span>
                </div>
                <span className="text-[11px] text-[var(--text-secondary)]">ChainSight Desk</span>
              </div>
            </div>

            {/* Button */}
            <button
              type="button"
              onClick={() => navigate("/settings")}
              className="w-full cs-btn cs-btn-secondary py-2 text-xs"
            >
              Update Notification Channels
            </button>
          </div>

          {/* Card 2: Key Port Health (from Screenshot) */}
          <div className="cs-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--text-high-contrast)]">
                Key Port Health
              </h3>
              <span className="text-[11px] text-[var(--text-dim)] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-success)]" />
                Live Sync
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {samplePortHealth.map((p) => {
                const isDelay = p.status.includes("Delay");
                const isClear = p.status.includes("Clear") || p.status.includes("Normal");
                const isQueue = p.status.includes("Queue");

                const statusColor = isDelay
                  ? "text-[var(--status-critical)]"
                  : isClear
                  ? "text-[var(--status-success)]"
                  : isQueue
                  ? "text-[var(--status-warning)]"
                  : "text-[var(--text-secondary)]";

                const dotColor = isDelay
                  ? "bg-[var(--status-critical)]"
                  : isClear
                  ? "bg-[var(--status-success)]"
                  : "bg-[var(--status-warning)]";

                return (
                  <div
                    key={p.name}
                    className="flex items-center justify-between py-1 border-b border-[var(--border-color)] last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                      <span className="font-medium text-[var(--text-high-contrast)]">
                        {p.name}
                      </span>
                    </div>
                    <span className={`font-semibold ${statusColor}`}>{p.status}</span>
                  </div>
                );
              })}
            </div>

            {/* Satellite Map Mock preview */}
            <div className="mt-3 rounded-lg overflow-hidden border border-[var(--border-color)] bg-[var(--surface-base)] relative h-28 flex items-center justify-center">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--accent-primary)_0%,_transparent_70%)]" />
              <div className="relative text-center p-3">
                <Compass size={24} className="mx-auto text-[var(--accent-cyan)] mb-1 opacity-70" />
                <span className="text-[11px] text-[var(--text-dim)] block">
                  Live satellite corridor overlay
                </span>
                <Link
                  to="/routes"
                  className="text-[11px] text-[var(--accent-cyan)] hover:underline font-semibold mt-1 inline-block"
                >
                  Full Map View &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* Card 3: Questions About an Advisory */}
          <div className="cs-card p-5 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--surface-overlay)] flex items-center justify-center text-[var(--accent-primary-light)] shrink-0">
              <Headphones size={20} />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-[var(--text-high-contrast)]">
                Questions about an advisory?
              </h4>
              <p className="text-[11px] text-[var(--text-secondary)] leading-snug">
                Our trade concierge clarifies all route notices and negotiates terminal priority on your behalf.
              </p>
              <button
                type="button"
                onClick={() => navigate("/rerouting")}
                className="text-[11px] text-[var(--accent-cyan)] font-semibold hover:underline block pt-1"
              >
                Request Autonomous Reroute &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
