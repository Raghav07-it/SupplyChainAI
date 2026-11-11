import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Package,
  Ship,
  Clock,
  AlertTriangle,
  ArrowRight,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Anchor,
  Compass,
  FileCheck,
  Check,
  Sparkles,
  Layers,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getDashboardStats } from "../api/dashboard";
import { getMyRouteAlerts } from "../api/alerts";
import EmptyState from "../components/ui/EmptyState";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import AddProductModal from "../components/products/AddProductModal";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [routeAlerts, setRouteAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dismissBanner, setDismissBanner] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [statsData, alertsData] = await Promise.all([
        getDashboardStats().catch(() => null),
        getMyRouteAlerts().catch(() => []),
      ]);
      setStats(statsData);
      setRouteAlerts(alertsData || []);
    } catch (err) {
      console.warn("Could not load dashboard data from backend:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const companyName =
    stats?.company_name || user?.company_name || user?.full_name || "Acme Ceramics Ltd";

  const productsCount = stats ? stats.products_count : 0;
  const activeShipmentsCount = stats ? stats.active_shipments_count : 0;
  const pendingShipmentsCount = stats ? stats.pending_shipments_count : 0;
  const recentShipments = stats?.recent_shipments || [];

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* =========================================================
          TOP HEADER (IMAGE 3 MATCH)
          ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">
              Supplier Portal <span className="text-[var(--text-dim)]">/</span> Global Logistics
            </span>
            <span className="text-[var(--text-dim)]">•</span>
            <span className="text-xs font-bold text-[var(--accent-cyan)] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--status-success)] animate-pulse" />
              Live Network Active • Updated 4 mins ago
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[var(--text-high-contrast)]">
            Welcome back, {companyName}
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1 max-w-2xl">
            Here is what is happening across your active cargo routes today.
          </p>
        </div>

        {/* Primary CTA */}
        <div>
          <Link
            to="/plan-shipment"
            className="cs-btn cs-btn-primary text-sm px-4 py-2.5 font-semibold shadow-lg"
          >
            <Plus size={16} />
            + Plan a new shipment
          </Link>
        </div>
      </div>

      {/* =========================================================
          4 STAT CARDS (IMAGE 3 MATCH)
          ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Products */}
        <div className="cs-card p-5 flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Products
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-[var(--text-high-contrast)] mt-2">
              {productsCount} item{productsCount === 1 ? "" : "s"}
            </div>
            <div className="text-xs font-semibold text-[var(--text-secondary)] mt-0.5">
              registered
            </div>
            <p className="text-xs text-[var(--accent-cyan)] mt-2.5 flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-[var(--accent-cyan)]" />
              {productsCount > 0 ? "Ready to ship" : "Catalog empty"}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[var(--accent-primary-bg)] border border-[rgba(99,102,241,0.3)] flex items-center justify-center text-[var(--accent-primary-light)] shrink-0">
            <Package size={20} />
          </div>
        </div>

        {/* Card 2: Active Shipments */}
        <div className="cs-card p-5 flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Active Shipments
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-[var(--text-high-contrast)] mt-2">
              {activeShipmentsCount} in transit
            </div>
            <p className="text-xs text-[var(--status-success)] mt-4 flex items-center gap-1.5 font-medium">
              <CheckCircle2 size={14} />
              {activeShipmentsCount > 0 ? "All on schedule" : "Zero vessels at sea"}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[var(--accent-cyan-bg)] border border-[rgba(6,182,212,0.3)] flex items-center justify-center text-[var(--accent-cyan)] shrink-0">
            <Ship size={20} />
          </div>
        </div>

        {/* Card 3: Pending Shipments */}
        <div className="cs-card p-5 flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Pending Shipments
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-[var(--text-high-contrast)] mt-2">
              {pendingShipmentsCount} awaiting
            </div>
            <div className="text-xs font-semibold text-[var(--text-secondary)] mt-0.5">
              booking
            </div>
            <p className="text-xs text-[var(--text-dim)] mt-2.5 flex items-center gap-1.5 font-medium">
              <Clock size={14} />
              {pendingShipmentsCount > 0 ? "Quotes valid for 48h" : "No pending bookings"}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[var(--surface-overlay)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] shrink-0">
            <Clock size={20} />
          </div>
        </div>

        {/* Card 4: Alerts on My Routes */}
        <div className="cs-card p-5 flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Alerts on My Routes
            </span>
            <div className={`text-2xl sm:text-3xl font-bold mt-2 ${routeAlerts.length > 0 ? "text-[var(--status-warning)]" : "text-[var(--text-high-contrast)]"}`}>
              {routeAlerts.length > 0 ? `${routeAlerts.length} port warning` : "0 active"}
            </div>
            <div className="mt-2.5">
              {routeAlerts.length > 0 ? (
                <span className="text-xs px-2.5 py-1 rounded-md bg-[var(--status-warning-bg)] text-[var(--status-warning)] border border-[var(--status-warning-border)] font-medium inline-block max-w-[200px] truncate">
                  {routeAlerts[0].title.split(".")[0] || "Rotterdam congestion warning"}
                </span>
              ) : (
                <span className="text-xs px-2.5 py-1 rounded-md bg-[rgba(16,185,129,0.12)] text-[var(--status-success)] border border-[rgba(16,185,129,0.3)] flex items-center gap-1 w-fit font-medium">
                  <CheckCircle2 size={13} /> All corridors clear
                </span>
              )}
            </div>
          </div>
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${routeAlerts.length > 0 ? "bg-[var(--status-warning-bg)] border border-[var(--status-warning-border)] text-[var(--status-warning)]" : "bg-[var(--surface-overlay)] border border-[var(--border-color)] text-[var(--text-secondary)]"}`}>
            <AlertTriangle size={20} />
          </div>
        </div>
      </div>

      {/* =========================================================
          MIDDLE ROW: RECENT SHIPMENTS (8 cols) + ROUTE ALERTS (4 cols)
          ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Recent Shipments Table (8 cols) */}
        <div className="lg:col-span-8 cs-card overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[var(--border-color)] flex items-center justify-between">
            <h2 className="text-base font-bold text-[var(--text-high-contrast)] flex items-center gap-2">
              <Ship size={18} className="text-[var(--accent-cyan)]" />
              Recent Shipments
            </h2>
            {recentShipments.length > 0 && (
              <Link
                to="/my-shipments"
                className="text-xs font-semibold text-[var(--accent-primary-light)] hover:underline flex items-center gap-1"
              >
                View all shipments
                <ArrowRight size={14} />
              </Link>
            )}
          </div>

          {loading ? (
            <div className="p-12 flex justify-center">
              <LoadingSpinner message="Loading recent cargo shipments…" />
            </div>
          ) : recentShipments.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={<Ship size={28} className="text-[var(--accent-cyan)]" />}
                message="No shipments recorded yet"
                description="Your workspace is empty. Plan your first cargo shipment to discover optimal ocean routes and live telemetry."
                actionLabel="Plan a Shipment"
                onAction={() => navigate("/plan-shipment")}
              />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="cs-table w-full">
                  <thead>
                    <tr>
                      <th>SHIPMENT ID</th>
                      <th>PRODUCT &amp; QUANTITY</th>
                      <th>ROUTE</th>
                      <th>ESTIMATED ARRIVAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentShipments.map((s) => (
                      <tr key={s.id} className="hover:bg-[var(--surface-overlay)]/40 transition-colors">
                        <td>
                          <Link
                            to={`/my-shipments?search=${s.id}`}
                            className="font-bold text-sm text-[var(--accent-cyan)] hover:underline font-mono"
                          >
                            #{s.tracking_number || s.id}
                          </Link>
                        </td>
                        <td>
                          <div className="font-semibold text-sm text-[var(--text-high-contrast)]">
                            {s.product}
                          </div>
                          <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                            {s.quantity} {s.quantity > 100 ? "crates/pallets" : "units"}
                          </div>
                        </td>
                        <td>
                          <div className="font-medium text-sm text-[var(--text-high-contrast)] flex items-center gap-1.5">
                            <span>{s.origin_port?.split("(")[0]?.trim() || "Origin"}</span>
                            <span className="text-[var(--accent-cyan)]">→</span>
                            <span>{s.destination_port?.split("(")[0]?.split("/")[0]?.trim() || "Destination"}</span>
                          </div>
                          <div className="text-xs text-[var(--text-dim)] mt-0.5">
                            {s.carrier || "Standard Liner"}
                          </div>
                        </td>
                        <td>
                          <div className="font-semibold text-sm text-[var(--text-high-contrast)]">
                            {s.expected_arrival}
                          </div>
                          <div className="text-xs text-[var(--status-success)] capitalize mt-0.5 flex items-center gap-1 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-success)]" />
                            {s.status.replace("_", " ")}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3.5 bg-[var(--surface-base)] border-t border-[var(--border-color)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-[var(--text-secondary)]">
                <span className="flex items-center gap-1.5 text-xs">
                  <ShieldCheck size={15} className="text-[var(--status-success)]" />
                  All sea waybills &amp; cargo insured through Lloyds Syndicates
                </span>
                <span className="text-xs text-[var(--text-dim)]">
                  Showing {recentShipments.length} of {recentShipments.length} active
                </span>
              </div>
            </>
          )}
        </div>

        {/* Right: Route & Port Alerts Widget (4 cols - IMAGE 3 MATCH) */}
        <div className="lg:col-span-4 cs-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <h2 className="text-base font-bold text-[var(--text-high-contrast)] flex items-center gap-2">
              <AlertTriangle size={18} className="text-[var(--status-warning)]" />
              Route &amp; Port Alerts
            </h2>
            <span className={`text-xs py-0.5 px-2.5 rounded-full font-semibold ${routeAlerts.length > 0 ? "bg-[var(--status-warning-bg)] text-[var(--status-warning)] border border-[var(--status-warning-border)]" : "bg-[var(--surface-overlay)] text-[var(--text-secondary)] border border-[var(--border-color)]"}`}>
              {routeAlerts.length} Alert{routeAlerts.length === 1 ? "" : "s"} Active
            </span>
          </div>

          {routeAlerts.length === 0 ? (
            <div className="p-6 rounded-xl bg-[var(--surface-base)] border border-[var(--border-color)] text-center space-y-2">
              <CheckCircle2 size={28} className="text-[var(--status-success)] mx-auto" />
              <div className="text-sm font-bold text-[var(--text-high-contrast)]">
                All Corridors Operational
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                No active delays, weather alerts, or port strikes detected on your active transport lanes.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {routeAlerts.slice(0, 2).map((a) => {
                const isNotice = a.severity === "medium" || a.severity === "warning" || a.category?.includes("Notice");
                const isClear = a.severity === "low" || a.category?.includes("Clear");

                return (
                  <div
                    key={a.id}
                    className="p-4 rounded-xl bg-[var(--surface-base)] border border-[var(--border-color)] space-y-2.5 hover:border-[var(--border-active)] transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-[var(--text-high-contrast)] flex items-center gap-1.5">
                        <Anchor size={14} className="text-[var(--accent-cyan)]" />
                        {a.port.split("(")[0]?.trim() || "Gateway"}
                      </span>
                      <span
                        className={`cs-pill text-[10px] py-0.5 px-2 uppercase font-semibold ${
                          isClear
                            ? "cs-pill-green"
                            : isNotice
                            ? "cs-pill-amber"
                            : "cs-pill-red"
                        }`}
                      >
                        {isClear ? "Clear" : "Notice"}
                      </span>
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {a.title}
                    </p>

                    <div className="text-[11px] text-[var(--text-dim)] pt-1 flex items-center justify-between border-t border-[var(--border-color)]">
                      <span>Berth 4A • Cleared for queue bypass</span>
                      {a.delay_hours > 0 && (
                        <span className="text-[var(--status-warning)]">~{a.delay_hours}h delay</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <Link
            to="/alerts"
            className="w-full cs-btn cs-btn-secondary text-xs sm:text-sm flex items-center justify-center gap-1.5 py-2"
          >
            See all alerts
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* =========================================================
          BOTTOM ONBOARDING SETUP GUIDE (IMAGE 3 MATCH)
          ========================================================= */}
      {!dismissBanner && (
        <div className="cs-card p-6 sm:p-7 bg-gradient-to-br from-[var(--surface-elevated)] via-[#151c2e] to-[var(--surface-base)] relative overflow-hidden rounded-2xl border border-[var(--border-color)] shadow-2xl">
          <button
            type="button"
            onClick={() => setDismissBanner(true)}
            className="absolute top-4 right-4 text-[var(--text-dim)] hover:text-white text-base p-1 transition-colors"
            aria-label="Dismiss banner"
          >
            <X size={18} />
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left 8 cols: Steps & CTA */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center gap-2">
                <span className="cs-pill cs-pill-blue text-xs font-semibold">
                  Quick Setup Guide
                </span>
                <span className="text-xs text-[var(--text-dim)]">
                  • Takes under 3 minutes
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-high-contrast)]">
                  Just getting started?
                </h3>
                <p className="text-sm text-[var(--text-secondary)] mt-1.5 max-w-xl leading-relaxed">
                  We streamline international freight, paperwork, and compliance so your ceramic goods glide effortlessly across borders.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[var(--accent-primary)] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[var(--text-high-contrast)]">
                      Add first product
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                      SKU, fragility specs, crate dims
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[var(--surface-overlay)] text-[var(--text-secondary)] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[var(--text-high-contrast)]">
                      Compare route rates
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                      Real-time ocean &amp; rail safety ratings
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[var(--surface-overlay)] text-[var(--text-secondary)] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[var(--text-high-contrast)]">
                      Track jargon-free
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                      Milestones in plain English updates
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(true)}
                  className="cs-btn cs-btn-primary text-sm px-5 py-2.5 font-semibold"
                >
                  <Plus size={16} />
                  + Add Your First Product
                </button>
              </div>
            </div>

            {/* Right 4 cols: Guaranteed Customs Clearance Subcard */}
            <div className="lg:col-span-4 p-5 rounded-2xl bg-[var(--surface-base)] border border-[var(--border-color)] space-y-3.5 shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary-bg)] border border-[rgba(99,102,241,0.3)] flex items-center justify-center text-[var(--accent-primary-light)]">
                <FileCheck size={20} />
              </div>
              <div>
                <div className="text-sm font-bold text-[var(--text-high-contrast)]">
                  Guaranteed Customs Clearance
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                  ChainSight automatically prepares EUR.1 certificates and harmonized HS classification codes for {companyName}.
                </p>
              </div>
              <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs">
                <span className="text-[var(--text-secondary)] font-mono">HS Code 6907.21</span>
                <span className="text-[var(--status-success)] flex items-center gap-1 font-semibold">
                  <Check size={14} />
                  Pre-verified 100% Valid
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal (Triggered by "+ Add Your First Product") */}
      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onSuccess={() => {
          loadData();
        }}
      />
    </div>
  );
}
