import { useState } from "react";
import { Link } from "react-router-dom";
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
  ExternalLink,
} from "lucide-react";
import { sampleProducts, sampleShipments, sampleAlerts } from "../data/sampleData";

export default function Dashboard() {
  const [dismissBanner, setDismissBanner] = useState(false);

  const recentShipments = [
    {
      id: "CS-8921",
      product: "Glazed Porcelain Tiles",
      quantity: "450 standard crates",
      origin: "Ningbo (CN)",
      dest: "Rotterdam (NL)",
      eta: "Oct 24, 2025",
    },
    {
      id: "CS-8890",
      product: "Artisan Terracotta Vases",
      quantity: "120 fragile boxes",
      origin: "Valencia (ES)",
      dest: "Felixstowe (UK)",
      eta: "Oct 29, 2025",
    },
    {
      id: "CS-8854",
      product: "Matte Floor Slabs",
      quantity: "310 heavy pallets",
      origin: "Qingdao (CN)",
      dest: "Hamburg (DE)",
      eta: "Nov 03, 2025",
    },
    {
      id: "CS-8802",
      product: "Ceramic Kitchenware Sample Kit",
      quantity: "40 parcel cartons",
      origin: "Marseille (FR)",
      dest: "New York (US)",
      eta: "Nov 07, 2025",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent-cyan)] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--status-success)] animate-pulse" />
              Live Network Active • Updated 4 mins ago
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--surface-overlay)] text-[var(--text-secondary)] border border-[var(--border-color)]">
              Sample data
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-high-contrast)]">
            Welcome back, Acme Ceramics Ltd
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Here is what is happening across your active cargo routes today.
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

      {/* 4 Stat Cards matching Screenshot 7 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Products */}
        <div className="cs-card p-5 flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Products
            </span>
            <div className="text-2xl lg:text-3xl font-bold text-[var(--text-high-contrast)] mt-2">
              18 items
            </div>
            <div className="text-xs font-semibold text-[var(--text-secondary)] mt-1">
              registered
            </div>
            <p className="text-xs text-[var(--accent-cyan)] mt-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-cyan)]" />
              Ready to ship
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
              4 in transit
            </div>
            <p className="text-xs text-[var(--status-success)] mt-3 flex items-center gap-1">
              <CheckCircle2 size={13} />
              All on schedule
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
              2 awaiting
            </div>
            <div className="text-xs font-semibold text-[var(--text-secondary)] mt-1">
              booking
            </div>
            <p className="text-xs text-[var(--text-dim)] mt-2 flex items-center gap-1">
              <Clock size={12} />
              Quotes valid for 48h
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
            <div className="text-2xl lg:text-3xl font-bold text-[var(--status-warning)] mt-2">
              1 port warning
            </div>
            <div className="mt-2">
              <span className="text-[11px] px-2 py-0.5 rounded bg-[var(--status-warning-bg)] text-[var(--status-warning)] border border-[var(--status-warning-border)]">
                Rotterdam congestion warning
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[var(--status-warning-bg)] border border-[var(--status-warning-border)] flex items-center justify-center text-[var(--status-warning)]">
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
            <Link
              to="/my-shipments"
              className="text-xs font-semibold text-[var(--accent-primary-light)] hover:underline flex items-center gap-1"
            >
              View all shipments
              <ArrowRight size={13} />
            </Link>
          </div>

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
                        {s.origin} → {s.dest}
                      </div>
                    </td>
                    <td>
                      <div className="font-semibold text-xs text-[var(--text-high-contrast)]">
                        {s.eta}
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
              All sea waybills & cargo insured through Lloyds Syndicates
            </span>
            <span className="text-[11px] text-[var(--text-dim)]">
              Showing 4 of 4 active
            </span>
          </div>
        </div>

        {/* Right: Route & Port Alerts Widget (4 cols) */}
        <div className="lg:col-span-4 cs-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[var(--text-high-contrast)] flex items-center gap-2">
              <AlertTriangle size={16} className="text-[var(--status-warning)]" />
              Route & Port Alerts
            </h2>
            <span className="cs-pill cs-pill-amber text-[10px] py-0 px-1.5">
              1 Alert Active
            </span>
          </div>

          {/* Alert Item 1: Rotterdam Gateway */}
          <div className="p-3.5 rounded-lg bg-[var(--surface-base)] border border-[var(--border-color)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--text-high-contrast)] flex items-center gap-1">
                <Anchor size={13} className="text-[var(--accent-cyan)]" />
                Rotterdam Gateway
              </span>
              <span className="cs-pill cs-pill-amber text-[10px] py-0 px-1.5">
                Notice
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Vessel turnaround delayed by ~36 hours due to crane maintenance. Your shipment <strong>#CS-8921</strong> is still expected on time.
            </p>
            <div className="text-[10px] text-[var(--text-dim)] pt-1 flex items-center gap-1">
              <Clock size={11} />
              Berth 4A • Cleared for queue bypass
            </div>
          </div>

          {/* Alert Item 2: Singapore Transshipment */}
          <div className="p-3.5 rounded-lg bg-[var(--surface-base)] border border-[var(--border-color)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--text-high-contrast)] flex items-center gap-1">
                <CheckCircle2 size={13} className="text-[var(--status-success)]" />
                Singapore Transshipment
              </span>
              <span className="cs-pill cs-pill-green text-[10px] py-0 px-1.5">
                Clear
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Clear weather, no backlog reported. Smooth passage through Malacca strait corridors.
            </p>
            <div className="text-[10px] text-[var(--text-dim)] pt-1 flex items-center gap-1">
              <Compass size={11} />
              Normal handling velocity (12h avg)
            </div>
          </div>

          <Link
            to="/alerts"
            className="w-full cs-btn cs-btn-secondary text-xs flex items-center justify-center gap-1.5"
          >
            See all alerts
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Bottom Section: Quick Setup Guide matching Screenshot 7 */}
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
            {/* Left Column: 3 Steps */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent-primary-light)]">
                  Quick Setup Guide • Takes under 3 minutes
                </span>
              </div>
              <h3 className="text-xl font-bold text-[var(--text-high-contrast)]">
                Just getting started?
              </h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-xl leading-relaxed">
                We streamline international freight, paperwork, and compliance so your ceramic goods glide effortlessly across borders.
              </p>

              {/* 3 Step Boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3 rounded-lg bg-[var(--surface-base)] border border-[var(--border-color)]">
                  <div className="w-5 h-5 rounded-full bg-[var(--accent-primary)] text-white text-[11px] font-bold flex items-center justify-center mb-2">
                    1
                  </div>
                  <div className="font-bold text-xs text-[var(--text-high-contrast)]">
                    Add first product
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                    SKU, fragility specs, crate dims
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[var(--surface-base)] border border-[var(--border-color)]">
                  <div className="w-5 h-5 rounded-full bg-[var(--surface-overlay)] text-[var(--text-secondary)] text-[11px] font-bold flex items-center justify-center mb-2">
                    2
                  </div>
                  <div className="font-bold text-xs text-[var(--text-high-contrast)]">
                    Compare route rates
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                    Real-time ocean & rail safety ratings
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[var(--surface-base)] border border-[var(--border-color)]">
                  <div className="w-5 h-5 rounded-full bg-[var(--surface-overlay)] text-[var(--text-secondary)] text-[11px] font-bold flex items-center justify-center mb-2">
                    3
                  </div>
                  <div className="font-bold text-xs text-[var(--text-high-contrast)]">
                    Track jargon-free
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                    Milestones in plain English updates
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

            {/* Right Column: Guaranteed Customs Clearance Box */}
            <div className="lg:col-span-4 p-5 rounded-xl bg-[var(--surface-base)] border border-[var(--border-color)] text-center space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--accent-primary-bg)] border border-[rgba(99,102,241,0.3)] flex items-center justify-center text-[var(--accent-primary-light)] mx-auto">
                <FileCheck size={20} />
              </div>
              <h4 className="text-sm font-bold text-[var(--text-high-contrast)]">
                Guaranteed Customs Clearance
              </h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                ChainSight automatically prepares EUR.1 certificates and harmonized HS classification codes for Acme Ceramics Ltd.
              </p>
              <div className="pt-2 flex items-center justify-center gap-2">
                <span className="cs-pill cs-pill-blue text-[10px]">
                  HS Code 6907.21 Pre-verified
                </span>
                <span className="cs-pill cs-pill-green text-[10px]">
                  100% Valid
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
