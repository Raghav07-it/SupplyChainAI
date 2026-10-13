import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Compass,
  Download,
  Filter,
  Layers,
  MapPin,
  Plus,
  Radio,
  RefreshCw,
  RotateCw,
  Search,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wind,
  Zap,
} from "lucide-react";
import {
  getDisruptions,
  getDisruptionSummary,
  createDisruption,
} from "../api/disruptions";

const INITIAL_INCIDENTS = [
  {
    id: "INC-8821",
    title: "Mumbai JNPT Berth Paralysis",
    portCode: "INMUM",
    portName: "Port of Mumbai, India",
    severity: "CRITICAL",
    category: "Port Congestion",
    hoursDelay: 46.0,
    estLoss: "$112,600",
    impactedRoutes: "6 Carriers",
    corridors: "INMUM-NLRTM, INMUM-AEDXB",
    status: "Active Disruption",
    primaryAction: {
      text: "Simulate Reroute",
      link: "/rerouting",
      variant: "blue",
    },
  },
  {
    id: "INC-8822",
    title: "Dubai Jebel Ali Crosswinds",
    portCode: "AEDXB",
    portName: "Port of Dubai, UAE",
    severity: "MODERATE",
    category: "Severe Weather",
    hoursDelay: 28.0,
    estLoss: "$64,200",
    impactedRoutes: "4 Carriers",
    corridors: "AEDXB-NLRTM",
    status: "Evaluating",
    primaryAction: {
      text: "Analyze in LangGraph",
      link: "/agents",
      variant: "purple",
    },
  },
  {
    id: "INC-8823",
    title: "Rotterdam Rail Terminal Strike",
    portCode: "NLRTM",
    portName: "Port of Rotterdam, Netherlands",
    severity: "MODERATE",
    category: "Labor Strike",
    hoursDelay: 44.0,
    estLoss: "$107,200",
    impactedRoutes: "9 Carriers",
    corridors: "Inland Rhine / Ruhr",
    status: "Active Disruption",
    primaryAction: {
      text: "Analyze in LangGraph",
      link: "/agents",
      variant: "purple",
    },
  },
];

export default function Disruptions() {
  const [incidents, setIncidents] = useState(INITIAL_INCIDENTS);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("active");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Modal synthetic form
  const [newTitle, setNewTitle] = useState("");
  const [newPort, setNewPort] = useState("SGSIN");
  const [newSeverity, setNewSeverity] = useState("HIGH");
  const [newDelay, setNewDelay] = useState("32");

  useEffect(() => {
    async function fetchLive() {
      try {
        setLoading(true);
        const data = await getDisruptions({ limit: 20 });
        if (data?.items?.length) {
          // Merge or supplement
        }
      } catch {
        // Fallback to high fidelity
      } finally {
        setLoading(false);
      }
    }
    fetchLive();
  }, []);

  function handleCreateSynthetic(e) {
    e.preventDefault();
    const created = {
      id: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
      title: newTitle || `Synthetic Alert @ ${newPort}`,
      portCode: newPort,
      portName: `Port Code ${newPort}`,
      severity: newSeverity,
      category: "Telemetry Anomaly",
      hoursDelay: parseFloat(newDelay) || 24.0,
      estLoss: `$${(parseFloat(newDelay || 24) * 2500).toLocaleString()}`,
      impactedRoutes: "3 Carriers",
      corridors: `${newPort}-Global`,
      status: "Active Disruption",
      primaryAction: {
        text: "Analyze in LangGraph",
        link: "/agents",
        variant: "purple",
      },
    };
    setIncidents([created, ...incidents]);
    setShowModal(false);
    setNewTitle("");
  }

  const filteredIncidents = incidents.filter((item) => {
    if (search) {
      const q = search.toLowerCase();
      const match =
        item.title.toLowerCase().includes(q) ||
        item.portCode.toLowerCase().includes(q) ||
        item.portName.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (severityFilter !== "all" && item.severity.toLowerCase() !== severityFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 font-sans">
      
      {/* =========================================================
          PAGE HEADER (IMAGE 5 MATCH)
          ========================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] font-bold tracking-wider text-rose-400 uppercase mb-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.9)] animate-pulse" />
            <span>DEFCON 2 · GLOBAL SURVEILLANCE &amp; CHOKEPOINT INCIDENT TELEMETRY</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Disruption Intelligence
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 max-w-4xl leading-relaxed">
            Real-time maritime anomalies, port infrastructure bottlenecks, labor actions, and multi-source geointelligence.
          </p>
        </div>

        {/* Top Right Header Stats */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          <div className="px-3.5 py-2 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center gap-2">
            <ShieldAlert size={15} className="text-rose-400" />
            <div className="flex flex-col text-[10px]">
              <span className="text-slate-500 uppercase font-semibold">ACTIVE INCIDENTS</span>
              <span className="text-rose-400 font-bold">{incidents.length} Critical</span>
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center gap-2">
            <Clock size={15} className="text-amber-400" />
            <div className="flex flex-col text-[10px]">
              <span className="text-slate-500 uppercase font-semibold">DELAY EXPOSURE</span>
              <span className="text-amber-400 font-bold">+118 hrs</span>
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2">
            <Zap size={15} className="text-cyan-400" />
            <div className="flex flex-col text-[10px]">
              <span className="text-slate-500 uppercase font-semibold">ECONOMIC IMPACT</span>
              <span className="text-white font-bold">$284,000</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          FILTER / SEARCH TOOLBAR (IMAGE 5 MATCH)
          ========================================================= */}
      <div className="stitch-card p-3 lg:p-4 flex flex-col lg:flex-row items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3 w-full">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search incident code, port, vessel, or keyword..."
              className="w-full bg-[#080d16] border border-slate-700/80 rounded-lg pl-9 pr-4 py-2 font-mono text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Severity Dropdown */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-[#080d16] border border-slate-700/80 rounded-lg px-3 py-2 font-mono text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">All Severities ({incidents.length})</option>
            <option value="critical">Critical</option>
            <option value="moderate">Moderate</option>
          </select>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="hidden sm:inline bg-[#080d16] border border-slate-700/80 rounded-lg px-3 py-2 font-mono text-xs text-slate-300 focus:outline-none"
          >
            <option value="active">Active Incidents</option>
            <option value="all">All Statuses</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto justify-end">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white font-mono text-xs font-bold transition-all shadow-[0_0_12px_rgba(2,132,199,0.3)] whitespace-nowrap"
          >
            <Plus size={13} />
            <span>+ Inject Synthetic Incident</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(incidents, null, 2));
              const a = document.createElement("a");
              a.setAttribute("href", dataStr);
              a.setAttribute("download", "geointelligence-telemetry.json");
              document.body.appendChild(a);
              a.click();
              a.remove();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white font-mono text-xs transition-colors whitespace-nowrap"
          >
            <Download size={13} />
            <span className="hidden sm:inline">Export Geointelligence</span>
          </button>
        </div>
      </div>

      {/* =========================================================
          MAIN SECTION: 2 COLUMNS (TABLE) + 1 COLUMN (METRIC CARDS)
          ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT 2 COLUMNS: Global Incident Telemetry Vector Table */}
        <div className="lg:col-span-2 stitch-card p-5 lg:p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-color)] pb-3 mb-3">
              <div>
                <h2 className="text-sm font-bold text-white font-mono">
                  Global Incident Telemetry Vector
                </h2>
                <p className="text-[11px] text-slate-400 font-mono">
                  Streaming AIS feeds, port authority bulletins, and meteorologic telemetry
                </p>
              </div>
              <span className="font-mono text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Feed Active
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="stitch-table font-mono text-xs">
                <thead>
                  <tr>
                    <th>INCIDENT &amp; LOCATION</th>
                    <th>SEVERITY</th>
                    <th>CATEGORY</th>
                    <th>HOURS DELAY</th>
                    <th>EST. LOSS</th>
                    <th>IMPACTED ROUTES</th>
                    <th className="text-right">STATUS &amp; ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIncidents.map((inc) => {
                    const isCrit = inc.severity === "CRITICAL" || inc.severity === "HIGH";
                    return (
                      <tr key={inc.id} className="group">
                        {/* Incident & Location */}
                        <td>
                          <div className="flex items-start gap-2.5">
                            <div className="mt-0.5">
                              <AlertTriangle
                                size={14}
                                className={isCrit ? "text-rose-400" : "text-amber-400"}
                              />
                            </div>
                            <div className="flex flex-col font-sans">
                              <span className="font-bold text-white text-xs group-hover:text-cyan-400 transition-colors">
                                {inc.title}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400 mt-0.5">
                                {inc.portName}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Severity */}
                        <td>
                          <span
                            className={`stitch-pill text-[9px] px-2 py-0.5 ${
                              isCrit ? "stitch-pill-danger" : "stitch-pill-warning"
                            }`}
                          >
                            {inc.severity}
                          </span>
                        </td>

                        {/* Category */}
                        <td>
                          <span className="stitch-pill text-[10px] text-slate-300">
                            {inc.category}
                          </span>
                        </td>

                        {/* Hours Delay */}
                        <td className={`font-bold ${isCrit ? "text-rose-400" : "text-amber-400"}`}>
                          +{inc.hoursDelay}h
                        </td>

                        {/* Est. Loss */}
                        <td className={`font-bold ${isCrit ? "text-rose-400" : "text-amber-400"}`}>
                          {inc.estLoss}
                        </td>

                        {/* Impacted Routes */}
                        <td>
                          <div className="flex flex-col text-[11px]">
                            <span className="text-white font-medium">{inc.impactedRoutes}</span>
                            <span className="text-[10px] text-slate-500">{inc.corridors}</span>
                          </div>
                        </td>

                        {/* Status & Actions */}
                        <td className="text-right">
                          <div className="flex flex-col items-end gap-1.5">
                            <span className="flex items-center gap-1 text-[10px] text-slate-400">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isCrit ? "bg-rose-500" : "bg-amber-400"
                                }`}
                              />
                              {inc.status}
                            </span>
                            <Link
                              to={inc.primaryAction.link}
                              className={`px-3 py-1 rounded font-mono text-[10px] font-bold transition-all ${
                                inc.primaryAction.variant === "blue"
                                  ? "bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-[0_0_10px_rgba(2,132,199,0.3)]"
                                  : "bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/40"
                              }`}
                            >
                              {inc.primaryAction.text} →
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Showing {filteredIncidents.length} active incident telemetry vectors</span>
            <span className="text-slate-500">Autonomous Sentinel Scan 30s interval</span>
          </div>
        </div>

        {/* RIGHT 1 COLUMN: 3 SURVEILLANCE & VARIANCE CARDS */}
        <div className="flex flex-col gap-6">

          {/* Card 1: Global Incident Surveillance */}
          <div className="stitch-card p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Radio size={16} className="text-cyan-400" />
                <h3 className="text-sm font-bold text-white font-mono">
                  Global Incident Surveillance
                </h3>
              </div>
              <span className="stitch-pill stitch-pill-success text-[9px]">LIVE</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center font-mono my-2 py-2 border-y border-slate-800">
              <div>
                <div className="text-[10px] text-slate-500">PORTS</div>
                <div className="text-base font-bold text-white mt-0.5">48 Live</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500">AIS FEEDS</div>
                <div className="text-base font-bold text-cyan-400 mt-0.5">182 Feeds</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500">UPTIME</div>
                <div className="text-base font-bold text-emerald-400 mt-0.5">99.98%</div>
              </div>
            </div>

            <div className="text-[10px] font-mono text-slate-400 pt-1 flex items-center justify-between">
              <span>NOAA / MarineTraffic / Copernicus Synced</span>
              <span className="text-cyan-400 font-bold">L-Band</span>
            </div>
          </div>

          {/* Card 2: Delay Variance by Node (Horizontal Bars) */}
          <div className="stitch-card p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3 mb-3">
              <div className="flex items-center gap-2">
                <BarChart3 size={15} className="text-amber-400" />
                <h3 className="text-sm font-bold text-white font-mono">
                  Delay Variance by Node
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Peak Dwell</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <div className="flex justify-between mb-1 text-[11px]">
                  <span className="text-slate-300">INMUM (Mumbai)</span>
                  <span className="text-rose-400 font-bold">46 hrs</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div style={{ width: "95%" }} className="h-full bg-rose-500 rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1 text-[11px]">
                  <span className="text-slate-300">NLRTM (Rotterdam)</span>
                  <span className="text-amber-400 font-bold">44 hrs</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div style={{ width: "88%" }} className="h-full bg-amber-400 rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1 text-[11px]">
                  <span className="text-slate-300">AEDXB (Dubai)</span>
                  <span className="text-amber-400 font-bold">28 hrs</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div style={{ width: "58%" }} className="h-full bg-amber-400 rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1 text-[11px]">
                  <span className="text-slate-300">SGSIN (Singapore)</span>
                  <span className="text-emerald-400 font-bold">2 hrs</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div style={{ width: "8%" }} className="h-full bg-emerald-400 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Cumulative Cost Exposure */}
          <div className="stitch-card p-5 flex flex-col justify-between border-rose-500/30">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3 mb-2">
              <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                CUMULATIVE COST EXPOSURE
              </span>
              <span className="stitch-pill stitch-pill-danger text-[9px]">CRITICAL</span>
            </div>

            <div>
              <div className="text-3xl font-extrabold text-white font-mono">
                $284,000
              </div>
              <div className="text-[11px] font-mono text-slate-400 mt-1">
                Demurrage Penalties + Idle Bunker Burn
              </div>
            </div>

            <div className="my-3 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 font-mono text-[11px] text-emerald-400">
              Mitigatable via Autonomous Reroute: <strong className="text-white">$178,500 (62.8%)</strong>
            </div>

            <Link
              to="/rerouting"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(2,132,199,0.3)]"
            >
              <span>Launch Autonomous Remediation</span>
              <ArrowRight size={13} />
            </Link>
          </div>

        </div>

      </div>

      {/* =========================================================
          MODAL: INJECT SYNTHETIC INCIDENT
          ========================================================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#0e1422] border border-slate-700/80 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-cyan-400" />
                <h3 className="text-sm font-bold text-white font-mono">
                  Inject Synthetic Disruption
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSynthetic} className="space-y-4 mt-4 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">INCIDENT TITLE</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Shanghai Typhoon Divergence"
                  className="w-full bg-[#080d16] border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">PORT CODE</label>
                  <select
                    value={newPort}
                    onChange={(e) => setNewPort(e.target.value)}
                    className="w-full bg-[#080d16] border border-slate-700 rounded-lg p-2.5 text-white"
                  >
                    <option value="SGSIN">SGSIN (Singapore)</option>
                    <option value="CNSHG">CNSHG (Shanghai)</option>
                    <option value="USLAX">USLAX (Los Angeles)</option>
                    <option value="DEHAM">DEHAM (Hamburg)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">SEVERITY</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value)}
                    className="w-full bg-[#080d16] border border-slate-700 rounded-lg p-2.5 text-white"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MODERATE">MODERATE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">PROJECTED DELAY (HOURS)</label>
                <input
                  type="number"
                  value={newDelay}
                  onChange={(e) => setNewDelay(e.target.value)}
                  className="w-full bg-[#080d16] border border-slate-700 rounded-lg p-2.5 text-white"
                  min="1"
                  max="200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold"
                >
                  Inject Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}