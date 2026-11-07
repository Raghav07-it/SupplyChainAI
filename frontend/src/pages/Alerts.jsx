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
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getMyRouteAlerts, getAllDisruptions } from "../api/alerts";
import { samplePortHealth } from "../data/sampleData";
import EmptyState from "../components/ui/EmptyState";
import LoadingSpinner from "../components/ui/LoadingSpinner";

export default function Alerts() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("my-routes"); // 'my-routes' | 'all' | 'resolved'
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [acknowledged, setAcknowledged] = useState(false);

  const [myRouteAlerts, setMyRouteAlerts] = useState([]);
  const [allDisruptions, setAllDisruptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      getMyRouteAlerts().catch(() => []),
      getAllDisruptions().catch(() => []),
    ])
      .then(([myAlerts, disruptions]) => {
        if (!isMounted) return;
        setMyRouteAlerts(Array.isArray(myAlerts) ? myAlerts : []);
        setAllDisruptions(Array.isArray(disruptions) ? disruptions : []);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const displayedAlerts = activeTab === "my-routes"
    ? myRouteAlerts
    : activeTab === "all"
    ? allDisruptions
    : [];

  const highCount = displayedAlerts.filter(
    (a) => (a.severity === "critical" || a.severity === "high" || a.type === "High Alert")
  ).length;

  const noticeCount = displayedAlerts.filter(
    (a) => (a.severity === "medium" || a.severity === "warning" || a.type === "Notice")
  ).length;

  const infoCount = displayedAlerts.length - highCount - noticeCount;

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
            className="cs-btn cs-btn-secondary text-xs"
          >
            <Filter size={14} />
            Filter Lane
          </button>
          <button
            type="button"
            onClick={() => setAcknowledged(true)}
            className="cs-btn cs-btn-primary text-xs"
          >
            <Check size={14} />
            {acknowledged ? "Acknowledged" : "Acknowledge All"}
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
            Only My Routes ({myRouteAlerts.length})
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
            Resolved (0)
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
          ) : activeTab === "resolved" ? (
            <div className="cs-card p-10 text-center">
              <CheckCircle2 size={36} className="mx-auto text-[var(--status-success)] mb-2" />
              <h3 className="font-semibold text-[var(--text-high-contrast)]">No resolved alerts in this period</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Resolved advisories are automatically archived after 30 days.
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
              const isHigh = alert.severity === "critical" || alert.severity === "high" || alert.type === "High Alert";
              const isNotice = alert.severity === "medium" || alert.severity === "warning" || alert.type === "Notice";

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
              const description = alert.description || (alert.delay_hours ? `Estimated delay impact: ~${alert.delay_hours} hours.` : "Monitoring route conditions.");
              const location = alert.port || alert.location || "Ocean Transit Corridor";
              const category = alert.category || alert.disruption_type || "Advisory";

              return (
                <div
                  key={alert.id}
                  className={`cs-card p-5 ${borderAccent} space-y-4`}
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

                  {/* What You Should Do Box (if present) */}
                  {(alert.whatToDo || alert.delay_hours) && (
                    <div className="bg-[var(--surface-base)] border border-[var(--border-color)] rounded-lg p-3 text-xs space-y-1">
                      <div className="font-semibold text-[var(--text-high-contrast)] flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-[var(--status-success)]" />
                        Recommended action
                      </div>
                      <p className="text-[var(--text-secondary)] pl-5 leading-relaxed">
                        {alert.whatToDo || `Coordinate with your carrier dispatch regarding the estimated ${alert.delay_hours}h berthing queue.`}
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
            <h3 className="text-sm font-bold text-[var(--text-high-contrast)] flex items-center gap-2">
              <SlidersHorizontal size={16} className="text-[var(--accent-primary-light)]" />
              Alert Preferences
            </h3>

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
                  onClick={() => setSmsAlerts(!smsAlerts)}
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

            {/* Forwarder Liaison */}
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

            <button
              type="button"
              className="w-full cs-btn cs-btn-secondary text-xs mt-2"
            >
              Update Notification Channels
            </button>
          </div>

          {/* Card 2: Key Port Health */}
          <div className="cs-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--text-high-contrast)]">
                Key Port Health
              </h3>
              <span className="text-[10px] font-semibold text-[var(--text-dim)]">Live Sync</span>
            </div>

            <div className="space-y-2">
              {samplePortHealth.map((item) => (
                <div
                  key={item.port}
                  className="flex items-center justify-between text-xs py-1.5 border-b border-[var(--border-color)] last:border-b-0"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        item.status === "red"
                          ? "bg-[var(--status-critical)]"
                          : item.status === "amber"
                          ? "bg-[var(--status-warning)]"
                          : "bg-[var(--status-success)]"
                      }`}
                    />
                    <span className="text-[var(--text-high-contrast)]">{item.port}</span>
                  </div>
                  <span
                    className={`font-semibold text-[11px] ${
                      item.status === "red"
                        ? "text-[var(--status-critical)]"
                        : item.status === "amber"
                        ? "text-[var(--status-warning)]"
                        : "text-[var(--status-success)]"
                    }`}
                  >
                    {item.info}
                  </span>
                </div>
              ))}
            </div>

            {/* Map preview box */}
            <div className="rounded-lg bg-[var(--surface-base)] border border-[var(--border-color)] p-3 text-center">
              <div className="h-20 rounded bg-[var(--canvas-base)] flex items-center justify-center text-xs text-[var(--text-dim)] border border-[var(--border-color)]">
                <span>Satellite Route Track Preview</span>
              </div>
              <button
                type="button"
                className="text-[11px] text-[var(--accent-cyan)] font-semibold mt-2 hover:underline inline-flex items-center gap-1"
              >
                Live satellite imagery Full Map View →
              </button>
            </div>

            {/* Concierge support */}
            <div className="p-2.5 rounded-lg bg-[var(--surface-base)] border border-[var(--border-color)] flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[var(--accent-primary-bg)] flex items-center justify-center text-[var(--accent-primary-light)] shrink-0">
                <Headphones size={14} />
              </div>
              <div className="text-[11px] leading-tight">
                <div className="font-semibold text-[var(--text-high-contrast)]">
                  Questions about an advisory?
                </div>
                <div className="text-[var(--text-secondary)]">
                  Our logistics concierge clarifies all route notices.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
