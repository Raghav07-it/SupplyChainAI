import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Ship,
  Clock,
  Award,
  FileText,
  Plus,
  Compass,
  Check,
  CheckCircle2,
  Search,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  Headphones,
  Navigation,
  Wind,
  MapPin,
  Anchor,
  Radio,
} from "lucide-react";
import { sampleShipments, sampleStats } from "../data/sampleData";

const TABS = [
  { id: "all", label: "All Shipments (6)" },
  { id: "transit", label: "Active in Transit 4" },
  { id: "awaiting", label: "Awaiting Departure 1" },
  { id: "delivered", label: "Delivered" },
];

export default function MyShipments() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedShipment, setSelectedShipment] = useState(sampleShipments[0]);

  const filteredShipments = sampleShipments.filter((s) => {
    if (activeTab === "transit" && s.status !== "At Sea") return false;
    if (activeTab === "awaiting" && s.status !== "Customs" && s.status !== "Minor Port Queue") return false;
    if (activeTab === "delivered" && s.status !== "Port Arrived") return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.id.toLowerCase().includes(q) ||
        s.product.toLowerCase().includes(q) ||
        s.carrier.toLowerCase().includes(q) ||
        s.routeFrom.toLowerCase().includes(q) ||
        s.routeTo.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent-cyan)] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--accent-cyan)] animate-pulse" />
              Cargo Tracker • Updated 4 mins ago
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--surface-overlay)] text-[var(--text-secondary)] border border-[var(--border-color)]">
              Sample data
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-high-contrast)]">
            My Shipments
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
            Monitor all your active, booked, and delivered sea cargo in real time without confusing freight terminology.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="cs-btn cs-btn-secondary text-xs"
          >
            <FileText size={14} />
            Export Cargo Log
          </button>
          <Link
            to="/plan-shipment"
            className="cs-btn cs-btn-primary text-xs"
          >
            <Plus size={14} />
            Plan another shipment
          </Link>
        </div>
      </div>

      {/* Top 3 Stat Cards matching Screenshot 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Active at Sea */}
        <div className="cs-card p-5 flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Active at Sea
            </span>
            <div className="text-3xl font-bold text-[var(--text-high-contrast)] mt-2">
              4 Vessels
            </div>
            <p className="text-xs text-[var(--status-success)] mt-1.5 flex items-center gap-1">
              <CheckCircle2 size={13} />
              All maintaining planned routes
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[var(--accent-cyan-bg)] border border-[rgba(6,182,212,0.3)] flex items-center justify-center text-[var(--accent-cyan)]">
            <Ship size={18} />
          </div>
        </div>

        {/* Card 2: Next Port Arrival */}
        <div className="cs-card p-5 flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Next Port Arrival
            </span>
            <div className="text-3xl font-bold text-[var(--text-high-contrast)] mt-2">
              Today, 18:30
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1.5">
              Rotterdam Gate 4 • Berth assigned
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[var(--accent-primary-bg)] border border-[rgba(99,102,241,0.3)] flex items-center justify-center text-[var(--accent-primary-light)]">
            <Clock size={18} />
          </div>
        </div>

        {/* Card 3: Delivered This Quarter */}
        <div className="cs-card p-5 flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Delivered This Quarter
            </span>
            <div className="text-3xl font-bold text-[var(--text-high-contrast)] mt-2">
              12 Shipments
            </div>
            <p className="text-xs text-[var(--status-success)] mt-1.5 flex items-center gap-1">
              ↗ 98.2% on-time guarantee
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[var(--status-warning-bg)] border border-[var(--status-warning-border)] flex items-center justify-center text-[var(--status-warning)]">
            <Award size={18} />
          </div>
        </div>
      </div>

      {/* Focused Shipment Banner with 4-Step Tracker */}
      <div className="cs-card p-6 space-y-5 bg-gradient-to-br from-[var(--surface-elevated)] to-[#151d2e] border-[var(--border-active)]">
        {/* Banner Top Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[var(--accent-primary-bg)] border border-[rgba(99,102,241,0.3)] flex items-center justify-center text-[var(--accent-primary-light)] shrink-0">
              <Compass size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[var(--text-high-contrast)]">
                  Focused Shipment: #{selectedShipment.id}
                </span>
                <span className="cs-pill cs-pill-green text-[10px] py-0 px-2">
                  ● At Sea (On Time)
                </span>
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                {selectedShipment.product} • {selectedShipment.routeFrom} to {selectedShipment.routeTo} Warehouse
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              className="cs-btn cs-btn-secondary text-xs py-1.5 px-3"
            >
              <FileText size={13} />
              Bill of Lading
            </button>
            <button
              type="button"
              className="cs-btn cs-btn-secondary text-xs py-1.5 px-3"
            >
              <Radio size={13} />
              Route Map
            </button>
          </div>
        </div>

        {/* Live Route Condition Callout */}
        <div className="p-3 rounded-lg bg-[var(--surface-base)] border border-[var(--border-color)] flex items-center gap-2.5 text-xs text-[var(--text-secondary)]">
          <CheckCircle2 size={15} className="text-[var(--status-success)] shrink-0" />
          <span>
            <strong className="text-[var(--text-high-contrast)]">Live Route Condition:</strong> "Your container is moving smoothly across the North Atlantic with no storms or route diversions."
          </span>
        </div>

        {/* 4-Step Milestone Stepper */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          {/* Step 1 */}
          <div className="p-3 rounded-lg bg-[var(--surface-base)] border border-[var(--border-color)] space-y-1">
            <div className="flex items-center justify-between text-[10px] text-[var(--text-dim)] uppercase font-semibold">
              <span>STEP 1</span>
              <Check size={14} className="text-[var(--status-success)]" />
            </div>
            <div className="font-bold text-xs text-[var(--text-high-contrast)]">Factory Pickup</div>
            <div className="text-[11px] text-[var(--text-secondary)]">Done • Oct 10</div>
          </div>

          {/* Step 2 */}
          <div className="p-3 rounded-lg bg-[var(--surface-base)] border border-[var(--border-color)] space-y-1">
            <div className="flex items-center justify-between text-[10px] text-[var(--text-dim)] uppercase font-semibold">
              <span>STEP 2</span>
              <Check size={14} className="text-[var(--status-success)]" />
            </div>
            <div className="font-bold text-xs text-[var(--text-high-contrast)]">Departed Valencia</div>
            <div className="text-[11px] text-[var(--text-secondary)]">Done • Oct 14</div>
          </div>

          {/* Step 3 (Current) */}
          <div className="p-3 rounded-lg bg-[var(--surface-overlay)] border border-[var(--accent-primary)] shadow-[0_0_12px_rgba(99,102,241,0.25)] space-y-1">
            <div className="flex items-center justify-between text-[10px] text-[var(--accent-primary-light)] uppercase font-bold">
              <span>STEP 3 • CURRENT</span>
              <Ship size={14} />
            </div>
            <div className="font-bold text-xs text-[var(--text-high-contrast)]">Atlantic Transit</div>
            <div className="text-[11px] text-[var(--accent-cyan)] font-medium">
              65% of sea route completed
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-3 rounded-lg bg-[var(--surface-base)] border border-[var(--border-color)] space-y-1 opacity-75">
            <div className="flex items-center justify-between text-[10px] text-[var(--text-dim)] uppercase font-semibold">
              <span>STEP 4</span>
              <Clock size={14} />
            </div>
            <div className="font-bold text-xs text-[var(--text-high-contrast)]">NY Warehouse Delivery</div>
            <div className="text-[11px] text-[var(--text-secondary)]">Expected Dec 1, 2025</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "bg-[var(--surface-overlay)] text-[var(--text-high-contrast)] border border-[var(--border-active)]"
                    : "text-[var(--text-secondary)] hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Filters */}
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)]"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by product or carrier…"
                className="cs-input pl-9 py-1.5 text-xs"
              />
            </div>
            <button
              type="button"
              className="cs-btn cs-btn-secondary text-xs py-1.5 px-3 shrink-0"
            >
              <SlidersHorizontal size={13} />
              Filters
            </button>
          </div>
        </div>

        {/* Shipments Table */}
        <div className="cs-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="cs-table w-full">
              <thead>
                <tr>
                  <th>TRACKING REF & DATE</th>
                  <th>CARGO / PRODUCT</th>
                  <th>ROUTE</th>
                  <th>CARRIER & ROUTE TYPE</th>
                  <th>ESTIMATED DELIVERY</th>
                  <th>STATUS</th>
                  <th className="text-right">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredShipments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-[var(--text-secondary)]">
                      No shipments matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredShipments.map((s) => {
                    const isSelected = selectedShipment.id === s.id;
                    const statusPill =
                      s.status === "At Sea"
                        ? "cs-pill cs-pill-cyan"
                        : s.status === "Port Arrived"
                        ? "cs-pill cs-pill-blue"
                        : "cs-pill cs-pill-amber";

                    return (
                      <tr
                        key={s.id}
                        onClick={() => setSelectedShipment(s)}
                        className={`cursor-pointer ${
                          isSelected ? "bg-[var(--surface-overlay)]/60" : ""
                        }`}
                      >
                        <td>
                          <div className="font-bold text-xs text-[var(--text-high-contrast)]">
                            #{s.id}
                          </div>
                          <div className="text-[11px] text-[var(--text-dim)]">
                            Booked {s.bookedDate}
                          </div>
                        </td>

                        <td>
                          <div className="font-semibold text-xs text-[var(--text-high-contrast)]">
                            {s.product}
                          </div>
                          <div className="text-[11px] text-[var(--text-secondary)]">
                            {s.description}
                          </div>
                        </td>

                        <td>
                          <div className="font-medium text-xs text-[var(--text-high-contrast)]">
                            {s.routeFrom} → {s.routeTo}
                          </div>
                          <div className="text-[11px] text-[var(--text-dim)]">
                            {s.routeName}
                          </div>
                        </td>

                        <td>
                          <div className="font-semibold text-xs text-[var(--text-high-contrast)]">
                            {s.carrier}
                          </div>
                          <div className="text-[11px] text-[var(--accent-primary-light)]">
                            ⚓ {s.routeType}
                          </div>
                        </td>

                        <td>
                          <div className="font-semibold text-xs text-[var(--text-high-contrast)]">
                            {s.estimatedDelivery}
                          </div>
                          <div className="text-[11px] text-[var(--status-success)]">
                            {s.statusDetail}
                          </div>
                        </td>

                        <td>
                          <span className={`${statusPill} text-[11px]`}>
                            {s.status} ({s.statusDetail})
                          </span>
                        </td>

                        <td className="text-right">
                          <button
                            type="button"
                            className="text-xs font-semibold text-[var(--accent-cyan)] hover:underline inline-flex items-center gap-1"
                          >
                            View Details
                            <ChevronRight size={12} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer with Pagination */}
          <div className="p-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>
              Showing 1 to {Math.min(filteredShipments.length, 5)} of {filteredShipments.length} active records
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-7 h-7 rounded border border-[var(--border-color)] flex items-center justify-center hover:bg-[var(--surface-overlay)] disabled:opacity-40"
              >
                <ChevronLeft size={13} />
              </button>
              <button
                type="button"
                className="w-7 h-7 rounded bg-[var(--accent-primary)] text-white font-bold flex items-center justify-center text-xs"
              >
                1
              </button>
              <button
                type="button"
                className="w-7 h-7 rounded border border-[var(--border-color)] flex items-center justify-center hover:bg-[var(--surface-overlay)] text-xs"
              >
                2
              </button>
              <button
                type="button"
                className="w-7 h-7 rounded border border-[var(--border-color)] flex items-center justify-center hover:bg-[var(--surface-overlay)]"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Dual Cards matching Screenshot 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Real-Time Transit Health */}
        <div className="cs-card p-5 space-y-3">
          <div className="flex items-center gap-2 text-[var(--accent-cyan)]">
            <Wind size={16} />
            <span className="text-[11px] font-bold uppercase tracking-wider">
              REAL-TIME TRANSIT HEALTH
            </span>
          </div>
          <h3 className="text-sm font-bold text-[var(--text-high-contrast)]">
            North Atlantic Route Advisory
          </h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Trade winds and calm seas currently prevail across the 40°N trade lane. No severe tropical depression or heavy swell alerts for ships heading into New York Harbor this week.
          </p>
          <div className="pt-2 border-t border-[var(--border-color)] grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="text-base font-bold text-[var(--text-high-contrast)]">14.8 knots</div>
              <div className="text-[11px] text-[var(--text-dim)]">Average Cruising Speed</div>
            </div>
            <div>
              <div className="text-base font-bold text-[var(--status-success)]">Zero Delays</div>
              <div className="text-[11px] text-[var(--text-dim)]">Weather Impact Index</div>
            </div>
          </div>
        </div>

        {/* Right: Dedicated Logistics Desk */}
        <div className="cs-card p-5 space-y-3 bg-gradient-to-br from-[var(--surface-elevated)] to-[#151d2f]">
          <div className="flex items-center gap-2 text-[var(--accent-primary-light)]">
            <Headphones size={16} />
            <span className="text-[11px] font-bold uppercase tracking-wider">
              DEDICATED LOGISTICS DESK
            </span>
          </div>
          <h3 className="text-sm font-bold text-[var(--text-high-contrast)]">
            Need cargo re-routing or customs clearance support?
          </h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            ChainSight cargo agents are on stand-by 24/7 to resolve paperwork hold-ups or negotiate berth priority.
          </p>
          <div className="pt-2">
            <button
              type="button"
              className="cs-btn cs-btn-secondary text-xs flex items-center gap-2"
            >
              <Headphones size={13} className="text-[var(--accent-primary-light)]" />
              Talk to Your Port Specialist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
