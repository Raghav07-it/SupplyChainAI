import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
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
  Radio,
  ChevronRight,
  Anchor,
  Trash2,
  Globe,
} from "lucide-react";
import { getShipments, deleteShipment } from "../api/shipments";
import EmptyState from "../components/ui/EmptyState";
import LoadingSpinner from "../components/ui/LoadingSpinner";

export default function MyShipments() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialSearch = searchParams.get("search") || "";
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [activeTab, setActiveTab] = useState("all");
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShipment, setSelectedShipment] = useState(null);

  async function loadShipmentsList() {
    setLoading(true);
    try {
      const data = await getShipments();
      const list = data || [];
      setShipments(list);
      if (list.length > 0) {
        setSelectedShipment(list[0]);
      } else {
        setSelectedShipment(null);
      }
    } catch (err) {
      console.warn("Failed to load shipments:", err.message);
      setShipments([]);
      setSelectedShipment(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadShipmentsList();
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to cancel and remove this shipment?")) return;

    try {
      await deleteShipment(id);
      const remaining = shipments.filter((s) => s.id !== id);
      setShipments(remaining);
      if (selectedShipment && selectedShipment.id === id) {
        setSelectedShipment(remaining.length > 0 ? remaining[0] : null);
      }
    } catch (err) {
      alert(err.message || "Could not delete shipment.");
    }
  };

  const activeInTransit = shipments.filter((s) =>
    ["in_transit", "at sea", "active"].includes((s.status || "").toLowerCase())
  );
  const awaitingDeparture = shipments.filter((s) =>
    ["pending", "customs", "booked", "minor port queue"].includes((s.status || "").toLowerCase())
  );
  const deliveredShipments = shipments.filter((s) =>
    ["delivered", "port arrived", "completed"].includes((s.status || "").toLowerCase())
  );

  const tabs = [
    { id: "all", label: `All Shipments (${shipments.length})` },
    { id: "transit", label: `Active in Transit (${activeInTransit.length})` },
    { id: "awaiting", label: `Awaiting Departure (${awaitingDeparture.length})` },
    { id: "delivered", label: `Delivered (${deliveredShipments.length})` },
  ];

  const filteredShipments = shipments.filter((s) => {
    const st = (s.status || "").toLowerCase();
    if (activeTab === "transit" && !["in_transit", "at sea", "active"].includes(st)) return false;
    if (activeTab === "awaiting" && !["pending", "customs", "booked", "minor port queue"].includes(st)) return false;
    if (activeTab === "delivered" && !["delivered", "port arrived", "completed"].includes(st)) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const trackId = (s.tracking_number || `CS-${s.id}`).toLowerCase();
      const prodName = (s.product_name || "").toLowerCase();
      const carrier = (s.carrier || "").toLowerCase();
      const orig = (s.origin_port || "").toLowerCase();
      const dest = (s.destination_port || "").toLowerCase();
      return (
        trackId.includes(q) ||
        prodName.includes(q) ||
        carrier.includes(q) ||
        orig.includes(q) ||
        dest.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-cyan)] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--accent-cyan)] animate-pulse" />
              Cargo Tracker • Live Fleet Telemetry
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[var(--text-high-contrast)]">
            My Shipments
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1 max-w-2xl leading-relaxed">
            Monitor all your active, booked, and delivered sea cargo in real time without confusing freight jargon.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            to="/intelligence"
            className="cs-btn cs-btn-secondary text-sm px-4 py-2.5 font-medium flex items-center gap-1.5"
          >
            <Globe size={16} />
            View Fleet on Map
          </Link>
          <Link
            to="/plan-shipment"
            className="cs-btn cs-btn-primary text-sm px-4 py-2.5 font-semibold"
          >
            <Plus size={16} />
            + Plan a new shipment
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="p-16 flex justify-center">
          <LoadingSpinner message="Retrieving your cargo telemetry…" />
        </div>
      ) : shipments.length === 0 ? (
        <div className="cs-card p-12">
          <EmptyState
            icon={<Ship size={32} className="text-[var(--accent-cyan)]" />}
            title="No Shipments Tracked Yet"
            description="Your cargo tracker is clean. Plan your first shipment to establish automated sea lanes, carrier quotes, and live port telemetry."
            actionLabel="Plan a Shipment"
            onAction={() => navigate("/plan-shipment")}
          />
        </div>
      ) : (
        <>
          {/* Top 3 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Card 1: Active In-Transit */}
            <div className="cs-card p-5 flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Active in Transit
                </span>
                <div className="text-2xl sm:text-3xl font-bold text-[var(--text-high-contrast)] mt-2">
                  {activeInTransit.length} at Sea
                </div>
                <p className="text-xs text-[var(--status-success)] mt-2 flex items-center gap-1 font-medium">
                  <CheckCircle2 size={13} />
                  Live GPS Tracking Active
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-[var(--accent-primary-bg)] border border-[rgba(99,102,241,0.3)] flex items-center justify-center text-[var(--accent-primary-light)] shrink-0">
                <Ship size={20} />
              </div>
            </div>

            {/* Card 2: Awaiting Departure */}
            <div className="cs-card p-5 flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Awaiting Departure
                </span>
                <div className="text-2xl sm:text-3xl font-bold text-[var(--text-high-contrast)] mt-2">
                  {awaitingDeparture.length} at Quay
                </div>
                <p className="text-xs text-[var(--accent-cyan)] mt-2 flex items-center gap-1 font-medium">
                  <Clock size={13} />
                  Customs cleared &amp; sealed
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-[var(--accent-cyan-bg)] border border-[rgba(6,182,212,0.3)] flex items-center justify-center text-[var(--accent-cyan)] shrink-0">
                <Clock size={20} />
              </div>
            </div>

            {/* Card 3: Delivered Shipments */}
            <div className="cs-card p-5 flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Delivered Cargo
                </span>
                <div className="text-2xl sm:text-3xl font-bold text-[var(--text-high-contrast)] mt-2">
                  {deliveredShipments.length} Completed
                </div>
                <p className="text-xs text-[var(--status-success)] mt-2 flex items-center gap-1 font-medium">
                  ↗ 100% On-time guarantee
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-[var(--status-warning-bg)] border border-[var(--status-warning-border)] flex items-center justify-center text-[var(--status-warning)] shrink-0">
                <Award size={20} />
              </div>
            </div>
          </div>

          {/* Focused Shipment Banner */}
          {selectedShipment && (
            <div className="cs-card p-6 space-y-5 bg-gradient-to-br from-[var(--surface-elevated)] via-[#151d2e] to-[var(--surface-base)] border-[var(--border-active)] rounded-2xl shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-[var(--accent-primary-bg)] border border-[rgba(99,102,241,0.3)] flex items-center justify-center text-[var(--accent-primary-light)] shrink-0">
                    <Compass size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-[var(--text-high-contrast)]">
                        Focused Shipment: #{selectedShipment.tracking_number || `CS-${selectedShipment.id}`}
                      </span>
                      <span className="cs-pill cs-pill-green text-xs py-0.5 px-2.5 capitalize font-semibold">
                        ● {selectedShipment.status.replace("_", " ")}
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
                      {selectedShipment.product_name} • {selectedShipment.origin_port || "Origin"} to {selectedShipment.destination_port || "Destination Hub"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono font-bold text-[var(--accent-primary-light)] bg-[var(--surface-base)] px-3 py-1.5 rounded-lg border border-[var(--border-color)]">
                    {selectedShipment.carrier || "Dedicated Carrier"}
                  </span>
                </div>
              </div>

              {/* Milestone Stepper */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-[var(--surface-base)] border border-[var(--border-color)] space-y-1">
                  <div className="flex items-center justify-between text-xs text-[var(--text-dim)] uppercase font-semibold">
                    <span>STEP 1</span>
                    <Check size={14} className="text-[var(--status-success)]" />
                  </div>
                  <div className="font-bold text-sm text-[var(--text-high-contrast)]">Origin Dispatch</div>
                  <div className="text-xs text-[var(--text-secondary)]">{selectedShipment.origin_port?.split("(")[0]?.trim() || "Factory Gate"}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--surface-base)] border border-[var(--border-color)] space-y-1">
                  <div className="flex items-center justify-between text-xs text-[var(--text-dim)] uppercase font-semibold">
                    <span>STEP 2</span>
                    <Check size={14} className="text-[var(--status-success)]" />
                  </div>
                  <div className="font-bold text-sm text-[var(--text-high-contrast)]">Port Clearance</div>
                  <div className="text-xs text-[var(--text-secondary)]">Customs Sealed</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--surface-overlay)] border border-[var(--accent-primary)] shadow-[0_0_14px_rgba(99,102,241,0.3)] space-y-1">
                  <div className="flex items-center justify-between text-xs text-[var(--accent-primary-light)] uppercase font-bold">
                    <span>STEP 3 • CURRENT</span>
                    <Ship size={14} />
                  </div>
                  <div className="font-bold text-sm text-[var(--text-high-contrast)]">Ocean Transit</div>
                  <div className="text-xs text-[var(--accent-cyan)] font-semibold capitalize">
                    {selectedShipment.status.replace("_", " ")}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--surface-base)] border border-[var(--border-color)] space-y-1 opacity-75">
                  <div className="flex items-center justify-between text-xs text-[var(--text-dim)] uppercase font-semibold">
                    <span>STEP 4</span>
                    <Clock size={14} />
                  </div>
                  <div className="font-bold text-sm text-[var(--text-high-contrast)]">Destination Hub</div>
                  <div className="text-xs text-[var(--text-secondary)]">ETA {selectedShipment.expected_arrival || "Pending"}</div>
                </div>
              </div>
            </div>
          )}

          {/* Filter Tabs & Search Bar */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? "bg-[var(--surface-overlay)] text-[var(--text-high-contrast)] border border-[var(--border-active)]"
                        : "text-[var(--text-secondary)] hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-72">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-dim)]"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by product, route or carrier…"
                  className="cs-input pl-10 py-2 text-sm"
                />
              </div>
            </div>

            {/* Shipments Table */}
            <div className="cs-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="cs-table w-full">
                  <thead>
                    <tr>
                      <th>TRACKING REF</th>
                      <th>CARGO / PRODUCT</th>
                      <th>ROUTE</th>
                      <th>CARRIER &amp; PLAN</th>
                      <th>ESTIMATED ARRIVAL</th>
                      <th>STATUS</th>
                      <th className="text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredShipments.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-[var(--text-secondary)] text-sm">
                          No shipments found matching "{searchQuery}".
                        </td>
                      </tr>
                    ) : (
                      filteredShipments.map((s) => {
                        const isSelected = selectedShipment?.id === s.id;
                        return (
                          <tr
                            key={s.id}
                            onClick={() => setSelectedShipment(s)}
                            className={`cursor-pointer transition-colors ${
                              isSelected
                                ? "bg-[var(--surface-overlay)]/70"
                                : "hover:bg-[var(--surface-overlay)]/40"
                            }`}
                          >
                            <td>
                              <span className="font-bold text-sm text-[var(--accent-cyan)] font-mono">
                                #{s.tracking_number || `CS-${s.id}`}
                              </span>
                              <div className="text-xs text-[var(--text-dim)] mt-0.5">
                                {new Date(s.created_at).toLocaleDateString()}
                              </div>
                            </td>
                            <td>
                              <div className="font-semibold text-sm text-[var(--text-high-contrast)]">
                                {s.product_name}
                              </div>
                              <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                                {s.quantity} units
                              </div>
                            </td>
                            <td>
                              <div className="font-medium text-sm text-[var(--text-high-contrast)]">
                                {s.origin_port || "Origin"} → {s.destination_port || "Destination Hub"}
                              </div>
                            </td>
                            <td>
                              <div className="font-semibold text-sm text-[var(--text-high-contrast)]">
                                {s.carrier || "Standard Carrier"}
                              </div>
                              <div className="text-xs text-[var(--accent-primary-light)] mt-0.5">
                                {s.route_type || "Direct Ocean"}
                              </div>
                            </td>
                            <td>
                              <div className="font-semibold text-sm text-[var(--text-high-contrast)]">
                                {s.expected_arrival || "Scheduled"}
                              </div>
                            </td>
                            <td>
                              <span className="cs-pill cs-pill-cyan text-xs capitalize">
                                {s.status.replace("_", " ")}
                              </span>
                            </td>
                            <td className="text-right">
                              <button
                                type="button"
                                onClick={(e) => handleDelete(s.id, e)}
                                className="p-2 rounded-lg text-[var(--text-dim)] hover:text-[var(--status-critical)] hover:bg-[rgba(239,68,68,0.1)] transition-colors"
                                title="Cancel Shipment"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
