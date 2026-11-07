import { useState, useEffect } from "react";
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
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getDashboardStats } from "../api/dashboard";
import { getMyRouteAlerts } from "../api/alerts";
import EmptyState from "../components/ui/EmptyState";
import LoadingSpinner from "../components/ui/LoadingSpinner";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [routeAlerts, setRouteAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dismissBanner, setDismissBanner] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [statsData, alertsData] = await Promise.all([
          getDashboardStats().catch(() => null),
          getMyRouteAlerts().catch(() => []),
        ]);
        if (isMounted) {
          setStats(statsData);
          setRouteAlerts(alertsData || []);
        }
      } catch (err) {
        console.warn("Could not load dashboard data from backend:", err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const companyName =
    stats?.company_name || user?.company_name || user?.full_name || "Supplier Workspace";

  const productsCount = stats ? stats.products_count : 0;
  const activeShipmentsCount = stats ? stats.active_shipments_count : 0;
  const pendingShipmentsCount = stats ? stats.pending_shipments_count : 0;
  const recentShipments = stats?.recent_shipments || [];

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent-cyan)] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--status-success)] animate-pulse" />
              Live Workspace Active • Scoped to {companyName}
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-high-contrast)]">
            Welcome back, {companyName}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Here is what is happening across your private cargo corridors today.
          </p>
        </div>

        {/* Primary CTA */}
        <div>
          <Link
            to="/plan-shipment"
            className="cs-btn cs-btn-primary text-xs"
          >
            <Plus size={14} />
            Plan a new shipment
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Products */}
        <div className="cs-card p-5 flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Products
            </span>
            <div className="text-2xl lg:text-3xl font-bold text-[var(--text-high-contrast)] mt-2">
              {productsCount} item{productsCount === 1 ? "" : "s"}
            </div>
            <div className="text-xs font-semibold text-[var(--text-secondary)] mt-1">
              registered
            </div>
            <p className="text-xs text-[var(--accent-cyan)] mt-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-cyan)]" />
              {productsCount > 0 ? "Ready to ship" : "Catalog empty"}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[var(--accent-primary-bg)] border border-[rgba(99,102,241,0.3)] flex items-center justify-center text-[var(--accent-primary-light)]">
            <Package size={18} />
          </div>
        </div>

        {/* Card 2: Active Shipments */}
        <div className="cs-card p-5 flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Active Shipments
            </span>
            <div className="text-2xl lg:text-3xl font-bold text-[var(--text-high-contrast)] mt-2">
              {activeShipmentsCount} in transit
            </div>
            <p className="text-xs text-[var(--status-success)] mt-3 flex items-center gap-1">
              <CheckCircle2 size={13} />
              {activeShipmentsCount > 0 ? "Tracking on schedule" : "Zero vessels at sea"}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[var(--accent-cyan-bg)] border border-[rgba(6,182,212,0.3)] flex items-center justify-center text-[var(--accent-cyan)]">
            <Ship size={18} />
          </div>
        </div>

        {/* Card 3: Pending Shipments */}
        <div className="cs-card p-5 flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Pending Shipments
            </span>
            <div className="text-2xl lg:text-3xl font-bold text-[var(--text-high-contrast)] mt-2">
              {pendingShipmentsCount} awaiting
            </div>
            <div className="text-xs font-semibold text-[var(--text-secondary)] mt-1">
              booking
            </div>
            <p className="text-xs text-[var(--text-dim)] mt-2 flex items-center gap-1">
              <Clock size={12} />
              {pendingShipmentsCount > 0 ? "Quotes valid for 48h" : "No pending bookings"}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[var(--surface-overlay)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)]">
            <Clock size={18} />
          </div>
        </div>

        {/* Card 4: Alerts on My Routes */}
        <div className="cs-card p-5 flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Alerts on My Routes
            </span>
            <div className={`text-2xl lg:text-3xl font-bold mt-2 ${routeAlerts.length > 0 ? "text-[var(--status-warning)]" : "text-[var(--text-high-contrast)]"}`}>
              {routeAlerts.length} active
            </div>
            <div className="mt-2">
              {routeAlerts.length > 0 ? (
                <span className="text-[11px] px-2 py-0.5 rounded bg-[var(--status-warning-bg)] text-[var(--status-warning)] border border-[var(--status-warning-border)]">
                  {routeAlerts[0].title.slice(0, 30)}…
                </span>
              ) : (
                <span className="text-[11px] px-2 py-0.5 rounded bg-[rgba(16,185,129,0.1)] text-[var(--status-success)] border border-[rgba(16,185,129,0.25)] flex items-center gap-1 w-fit">
                  <CheckCircle2 size={11} /> All corridors clear
                </span>
              )}
            </div>
          </div>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${routeAlerts.length > 0 ? "bg-[var(--status-warning-bg)] border border-[var(--status-warning-border)] text-[var(--status-warning)]" : "bg-[var(--surface-overlay)] border border-[var(--border-color)] text-[var(--text-secondary)]"}`}>
            <AlertTriangle size={18} />
          </div>
        </div>
      </div>

      {/* Middle Row: Recent Shipments (8 cols) + Route Alerts (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Recent Shipments Table (8 cols) */}
        <div className="lg:col-span-8 cs-card overflow-hidden">
          <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
            <h2 className="text-sm font-bold text-[var(--text-high-contrast)] flex items-center gap-2">
              <Ship size={16} className="text-[var(--accent-cyan)]" />
              Recent Shipments
            </h2>
            {recentShipments.length > 0 && (
              <Link
                to="/my-shipments"
                className="text-xs font-semibold text-[var(--accent-primary-light)] hover:underline flex items-center gap-1"
              >
                View all shipments
                <ArrowRight size={13} />
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
                icon={<Ship size={24} className="text-[var(--accent-cyan)]" />}
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
                      <th>PRODUCT & QUANTITY</th>
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
                            className="font-bold text-xs text-[var(--accent-cyan)] hover:underline"
                          >
                            #{s.id}
                          </Link>
                        </td>
                        <td>
                          <div className="font-semibold text-xs text-[var(--text-high-contrast)]">
                            {s.product}
                          </div>
                          <div className="text-[11px] text-[var(--text-secondary)]">
                            {s.quantity}
                          </div>
                        </td>
                        <td>
                          <div className="font-medium text-xs text-[var(--text-high-contrast)]">
                            {s.origin_port || "Origin"} → {s.destination_port || "Destination"}
                          </div>
                          <div className="text-[10px] text-[var(--text-dim)]">
                            {s.carrier || "Standard Carrier"}
                          </div>
                        </td>
                        <td>
                          <div className="font-semibold text-xs text-[var(--text-high-contrast)]">
                            {s.expected_arrival}
                          </div>
                          <div className="text-[10px] text-[var(--status-success)] capitalize">
                            {s.status}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-[var(--surface-base)] border-t border-[var(--border-color)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <ShieldCheck size={14} className="text-[var(--status-success)]" />
                  All sea waybills & cargo protected under escrow
                </span>
                <span className="text-[11px] text-[var(--text-dim)]">
                  Showing {recentShipments.length} active record{recentShipments.length === 1 ? "" : "s"}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Right: Route & Port Alerts Widget (4 cols) */}
        <div className="lg:col-span-4 cs-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[var(--text-high-contrast)] flex items-center gap-2">
              <AlertTriangle size={16} className="text-[var(--status-warning)]" />
              Route & Port Alerts
            </h2>
            <span className={`text-[10px] py-0.5 px-2 rounded font-semibold ${routeAlerts.length > 0 ? "bg-[var(--status-warning-bg)] text-[var(--status-warning)] border border-[var(--status-warning-border)]" : "bg-[var(--surface-overlay)] text-[var(--text-secondary)] border border-[var(--border-color)]"}`}>
              {routeAlerts.length} Active
            </span>
          </div>

          {routeAlerts.length === 0 ? (
            <div className="p-6 rounded-lg bg-[var(--surface-base)] border border-[var(--border-color)] text-center space-y-2">
              <CheckCircle2 size={24} className="text-[var(--status-success)] mx-auto" />
              <div className="text-xs font-semibold text-[var(--text-high-contrast)]">
                All Corridors Operational
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                No active delays, weather alerts, or port strikes detected on your active transport lanes.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {routeAlerts.slice(0, 3).map((a) => (
                <div key={a.id} className="p-3.5 rounded-lg bg-[var(--surface-base)] border border-[var(--border-color)] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--text-high-contrast)] flex items-center gap-1">
                      <Anchor size={13} className="text-[var(--accent-cyan)]" />
                      {a.port}
                    </span>
                    <span className="cs-pill cs-pill-amber text-[10px] py-0 px-1.5 uppercase">
                      {a.severity}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {a.title}
                  </p>
                  <div className="text-[10px] text-[var(--text-dim)] pt-1 flex items-center gap-1">
                    <Clock size={11} />
                    Affects shipment <strong className="text-[var(--accent-cyan)]">#{a.shipment_ref}</strong> • ~{a.delay_hours}h delay
                  </div>
                </div>
              ))}
            </div>
          )}

          <Link
            to="/alerts"
            className="w-full cs-btn cs-btn-secondary text-xs flex items-center justify-center gap-1.5"
          >
            See all alerts
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Bottom Section: Quick Setup Guide */}
      {!dismissBanner && (
        <div className="cs-card p-6 bg-gradient-to-br from-[var(--surface-elevated)] via-[#151c2e] to-[var(--surface-base)] relative overflow-hidden">
          <button
            type="button"
            onClick={() => setDismissBanner(true)}
            className="absolute top-4 right-4 text-[var(--text-dim)] hover:text-white text-sm"
            aria-label="Dismiss banner"
          >
            ✕
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center gap-2">
                <span className="cs-pill cs-pill-indigo text-[11px] font-semibold">
                  Quick Setup Guide
                </span>
                <span className="text-[11px] text-[var(--text-dim)]">
                  Takes under 3 minutes
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-[var(--text-high-contrast)]">
                  Welcome to ChainSight AI
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-xl leading-relaxed">
                  We streamline international freight, paperwork, and compliance so your cargo glides effortlessly across borders.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[var(--accent-primary)] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[var(--text-high-contrast)]">
                      Add first product
                    </div>
                    <div className="text-[11px] text-[var(--text-dim)]">
                      SKU, fragility specs, crate dims
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[var(--surface-overlay)] text-[var(--text-secondary)] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[var(--text-high-contrast)]">
                      Compare route rates
                    </div>
                    <div className="text-[11px] text-[var(--text-dim)]">
                      Real-time ocean & rail safety ratings
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[var(--surface-overlay)] text-[var(--text-secondary)] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[var(--text-high-contrast)]">
                      Track jargon-free
                    </div>
                    <div className="text-[11px] text-[var(--text-dim)]">
                      Milestones in plain English updates
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/products?add=true"
                  className="cs-btn cs-btn-primary text-xs"
                >
                  <Plus size={14} />
                  Add Your First Product
                </Link>
              </div>
            </div>

            {/* Right: Guaranteed Customs Clearance Mini Box */}
            <div className="lg:col-span-4 p-4 rounded-xl bg-[var(--surface-base)] border border-[var(--border-color)] space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[var(--accent-primary-bg)] border border-[rgba(99,102,241,0.3)] flex items-center justify-center text-[var(--accent-primary-light)]">
                <FileCheck size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-[var(--text-high-contrast)]">
                  Guaranteed Customs Clearance
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] mt-1 leading-relaxed">
                  ChainSight automatically prepares EUR.1 certificates and harmonized HS classification codes for {companyName}.
                </p>
              </div>
              <div className="pt-2 border-t border-[var(--border-color)] flex items-center justify-between text-[11px]">
                <span className="text-[var(--text-dim)] font-mono">Customs Escrow</span>
                <span className="text-[var(--status-success)] flex items-center gap-1 font-semibold">
                  <Check size={12} />
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
