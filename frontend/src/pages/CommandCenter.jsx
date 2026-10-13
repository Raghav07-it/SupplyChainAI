import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Anchor,
  ArrowRight,
  CheckCircle2,
  Clock,
  Compass,
  ExternalLink,
  Layers,
  MapPin,
  RefreshCw,
  RotateCw,
  Route,
  ShieldCheck,
  Ship,
  Sparkles,
  TrendingUp,
  Wind,
  Wifi,
} from "lucide-react";

import {
  getDisruptionSummary,
  getDisruptions,
} from "../api/disruptions";
import { getWeightedRoute } from "../api/routing";

export default function CommandCenter() {
  const [summary, setSummary] = useState(null);
  const [disruptions, setDisruptions] = useState([]);
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastSyncText, setLastSyncText] = useState("Updated 2m ago");

  async function loadData() {
    try {
      setLoading(true);
      const [summaryRes, disruptionsRes, routeRes] = await Promise.allSettled([
        getDisruptionSummary(),
        getDisruptions({ limit: 10 }),
        getWeightedRoute({ origin: "Singapore", destination: "Rotterdam" }),
      ]);

      if (summaryRes.status === "fulfilled") setSummary(summaryRes.value);
      if (disruptionsRes.status === "fulfilled") setDisruptions(disruptionsRes.value?.items || []);
      if (routeRes.status === "fulfilled") setRoute(routeRes.value);
    } catch {
      // Keep rich operational defaults
    } finally {
      setLoading(false);
      setLastSyncText("Updated just now");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 font-sans">
      
      {/* =========================================================
          PAGE HEADER BANNER (MATCHING IMAGE 3)
          ========================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight font-sans">
              Command Center
            </h1>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 font-mono text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              SYSTEM OPERATIONAL
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 font-mono text-[10px] font-semibold text-sky-400 uppercase tracking-wider">
              <Wifi size={10} />
              AUTONOMOUS DISPATCH ACTIVE
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1.5 font-mono">
            Autonomous Control Tower &amp; Global Supply Chain Telemetry
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-400 font-mono text-xs">
            <Clock size={13} className="text-slate-500" />
            <span>{lastSyncText}</span>
          </div>
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(2,132,199,0.3)] disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>Manual Sync</span>
          </button>
        </div>
      </div>

      {/* =========================================================
          TOP 6 KPI CARDS (IMAGE 3 MATCH)
          ========================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 lg:gap-4">
        
        {/* Card 1: Active Disruptions */}
        <div className="stitch-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="stitch-label text-[10px]">ACTIVE DISRUPTIONS</span>
            <AlertTriangle size={15} className="text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-2xl font-extrabold text-white font-mono">
              {summary?.total_disruptions ?? disruptions.length ?? 3}
            </span>
            <span className="text-xs font-mono text-slate-400">Active</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400">1 Critical · 2 Moderate</div>
          <div className="mt-2 pt-2 border-t border-[var(--border-color)] text-[10px] font-mono text-rose-400 flex items-center gap-1 font-semibold">
            <span>↗ +1 in last 6h</span>
          </div>
        </div>

        {/* Card 2: Port Risks */}
        <div className="stitch-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="stitch-label text-[10px]">PORT RISKS</span>
            <span className="stitch-pill stitch-pill-danger text-[9px] px-1.5 py-0.5">HIGH RISK</span>
          </div>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-2xl font-extrabold text-white font-mono">2</span>
            <span className="text-xs font-mono text-slate-400">Ports Flagged</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono">
            <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold">INMUM</span>
            <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 font-bold">NL-RTM</span>
          </div>
          <div className="mt-2 pt-2 border-t border-[var(--border-color)] text-[10px] font-mono text-slate-400 flex items-center gap-1">
            <Anchor size={11} className="text-amber-400" />
            <span>Berth latency &gt;36h</span>
          </div>
        </div>

        {/* Card 3: Routes Monitored */}
        <div className="stitch-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="stitch-label text-[10px]">ROUTES MONITORED</span>
            <Route size={15} className="text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-2xl font-extrabold text-white font-mono">14</span>
            <span className="text-xs font-mono text-slate-400">Active</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400">Asia · Europe · Americas</div>
          <div className="mt-2 pt-2 border-t border-[var(--border-color)] text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>12 Normal telemetry</span>
          </div>
        </div>

        {/* Card 4: Active Shipments */}
        <div className="stitch-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="stitch-label text-[10px]">ACTIVE SHIPMENTS</span>
            <Ship size={15} className="text-slate-400" />
          </div>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-2xl font-extrabold text-white font-mono">1,284</span>
            <span className="text-xs font-mono text-slate-400">TEU</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400">In Transit Vessels: 28</div>
          <div className="mt-2 pt-2 border-t border-[var(--border-color)] text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-semibold">
            <span>↗ $48.2M cargo value</span>
          </div>
        </div>

        {/* Card 5: Pending Decisions */}
        <div className="stitch-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="stitch-label text-[10px]">PENDING DECISIONS</span>
            <span className="stitch-pill stitch-pill-blue text-[9px] px-1.5 py-0.5">AI ACTION</span>
          </div>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-2xl font-extrabold text-white font-mono">1</span>
            <span className="text-xs font-mono text-slate-400">Reroute Recom.</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400">LangGraph Engine v2.4</div>
          <div className="mt-2 pt-2 border-t border-[var(--border-color)] text-[10px] font-mono text-sky-400 flex items-center gap-1 font-semibold">
            <span>Saves 46h buffer</span>
          </div>
        </div>

        {/* Card 6: Network Index */}
        <div className="stitch-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="stitch-label text-[10px]">NETWORK INDEX</span>
            <CheckCircle2 size={15} className="text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-2xl font-extrabold text-white font-mono">94.2%</span>
            <span className="text-xs font-mono text-slate-400">Uptime</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400">Global SLA Target 92%</div>
          <div className="mt-2 pt-2 border-t border-[var(--border-color)] text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-semibold">
            <span>↗ +0.8% past 24h</span>
          </div>
        </div>

      </div>

      {/* =========================================================
          MAIN CENTER SECTION: 2 COLUMNS (MAP) + 1 COLUMN (SIGNALS)
          ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT 2 COLUMNS: Global Transit Telemetry & Route Vector Plane */}
        <div className="lg:col-span-2 stitch-card p-5 lg:p-6 flex flex-col justify-between">
          
          {/* Header of Map Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-cyan-400">
                <Compass size={16} />
              </div>
              <div>
                <h2 className="text-base font-bold text-white font-mono">
                  Global Transit Telemetry &amp; Route Vector Plane
                </h2>
                <p className="text-[11px] text-slate-400 font-mono">
                  Live Corridors · Real-time AIS Stream &amp; Automated Route Divergence
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="stitch-pill bg-slate-900 border-rose-500/30 text-rose-300 font-mono text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                LIVE AIS SATELLITE: L-BAND SYNCHRONIZED
              </span>
            </div>
          </div>

          {/* SVG Map Visualization Area */}
          <div className="relative my-4 rounded-xl bg-[#070b12] border border-slate-800/80 p-4 min-h-[360px] flex flex-col justify-between overflow-hidden">
            
            {/* World Vector Plane Background Graphic */}
            <div className="absolute inset-0 opacity-40 pointer-events-none">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <circle cx="15" cy="15" r="0.75" fill="#334155" />
                  </pattern>
                  <linearGradient id="gradient-teal" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.9" />
                  </linearGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                
                {/* Continent Silhouettes (Abstract Dark Blobs) */}
                <path
                  d="M100 80 Q180 50 250 90 T380 110 T460 70 Q510 120 480 180 T400 240 T290 220 Z"
                  fill="#111827"
                  opacity="0.8"
                />
                <path
                  d="M480 140 Q570 120 640 160 T760 210 T720 280 T610 270 T520 220 Z"
                  fill="#111827"
                  opacity="0.8"
                />
                <path
                  d="M240 220 Q320 210 360 290 T330 350 T250 330 Z"
                  fill="#111827"
                  opacity="0.7"
                />

                {/* Default Blocked Trajectory (Red/Orange Dashed Line) */}
                <path
                  d="M 280 120 Q 380 170 540 220"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                  opacity="0.85"
                />

                {/* AI Alternate Vector (Teal Glowing Smooth Curve) */}
                <path
                  d="M 280 120 Q 370 130 450 150 T 630 260"
                  fill="none"
                  stroke="url(#gradient-teal)"
                  strokeWidth="3.5"
                  filter="drop-shadow(0 0 8px rgba(6, 182, 212, 0.8))"
                />
              </svg>
            </div>

            {/* Interactive Pins & Tooltips on the Map */}
            <div className="relative z-10 flex flex-col justify-between h-full min-h-[300px]">
              
              {/* Top Port Pin: NLRTM (Rotterdam) */}
              <div className="absolute top-6 left-12 md:left-24">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-indigo-500 border-2 border-slate-900 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                  <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded px-2.5 py-1 font-mono text-[11px] text-white flex flex-col shadow-lg">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold">NLRTM (Rotterdam)</span>
                      <span className="px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300 text-[9px] font-bold">WATCH</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Terminal labor negotiations; contingency staged.</span>
                  </div>
                </div>
              </div>

              {/* Middle Port Pin: AEDXB (Dubai) */}
              <div className="absolute top-28 left-[45%]">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-slate-900 shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
                  <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded px-2.5 py-1 font-mono text-[11px] text-white flex flex-col shadow-lg">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold">AEDXB (Dubai)</span>
                      <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold">MODERATE</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Wind &gt;38 kts. Jebel Ali crane speed halved.</span>
                  </div>
                </div>
              </div>

              {/* Right Port Pin: INMUM (Mumbai) + Risk Callout */}
              <div className="absolute bottom-16 right-10 md:right-28">
                <div className="flex flex-col items-end gap-1.5">
                  <div className="px-2.5 py-1 rounded bg-rose-600/90 border border-rose-400 text-white font-mono text-[10px] font-bold uppercase shadow-[0_0_15px_rgba(244,63,94,0.4)]">
                    DEFAULT CORRIDOR · RISK 72/100
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-slate-900/90 backdrop-blur-md border border-rose-500/40 rounded px-2.5 py-1 font-mono text-[11px] text-white flex flex-col shadow-lg text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="font-bold">INMUM (Mumbai)</span>
                        <span className="px-1 py-0.2 rounded bg-rose-500/20 text-rose-300 text-[9px] font-bold">CRITICAL</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Monsoon surge. Wait: +44h</span>
                    </div>
                    <div className="w-4 h-4 rounded-full bg-rose-500 border-2 border-white shadow-[0_0_12px_rgba(244,63,94,0.9)] animate-pulse" />
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Scale & Legend inside Map */}
            <div className="relative z-10 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-[10px] font-mono text-slate-400">
              <div className="flex items-center gap-4">
                <span className="font-bold uppercase tracking-wider text-slate-500">TELEMETRY SCALE:</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Optimal
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Moderate
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  High Watch
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Critical
                </span>
              </div>
              <div className="flex items-center gap-2 text-cyan-400 font-semibold">
                <span className="w-5 h-0.5 bg-cyan-400" />
                <span>AI Alternate Vector</span>
              </div>
            </div>

          </div>

          {/* Bottom Evaluation Banner (Links to /rerouting) */}
          <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-sky-950/40 border border-purple-500/30 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 font-mono text-xs">
              <div className="p-1.5 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300">
                <Sparkles size={16} />
              </div>
              <span className="text-slate-200">
                Corridor Evaluation Agent <strong className="text-purple-300 font-mono">#R4-88</strong>: Singapore reroute saves <strong className="text-emerald-400 font-mono">$38,400</strong> in demurrage risk
              </span>
            </div>

            <Link
              to="/rerouting"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)] whitespace-nowrap"
            >
              <span>Evaluate Autonomous Reroute</span>
              <ArrowRight size={13} />
            </Link>
          </div>

        </div>

        {/* RIGHT 1 COLUMN: Network Risk Profile & Live Disruption Signals */}
        <div className="flex flex-col gap-6">

          {/* Card 1: Network Risk Profile */}
          <div className="stitch-card p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3 border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-cyan-400" />
                <h3 className="text-sm font-bold text-white font-mono">
                  Network Risk Profile
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">14 Major Corridors</span>
            </div>

            {/* Stacked Progress Bar */}
            <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex my-2">
              <div style={{ width: "62%" }} className="h-full bg-emerald-400" title="Optimal: 62%" />
              <div style={{ width: "24%" }} className="h-full bg-amber-400" title="Moderate: 24%" />
              <div style={{ width: "10%" }} className="h-full bg-indigo-400" title="High Watch: 10%" />
              <div style={{ width: "4%" }} className="h-full bg-rose-500" title="Critical: 4%" />
            </div>

            {/* 4 Legend Breakdown Items */}
            <div className="grid grid-cols-2 gap-2.5 mt-3 pt-2 font-mono text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Optimal
                </span>
                <span className="font-bold text-emerald-400">62%</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Moderate
                </span>
                <span className="font-bold text-amber-400">24%</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  High Watch
                </span>
                <span className="font-bold text-indigo-400">10%</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Critical
                </span>
                <span className="font-bold text-rose-400">4%</span>
              </div>
            </div>
          </div>

          {/* Card 2: Live Disruption Signals */}
          <div className="stitch-card p-5 flex flex-col justify-between flex-1">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3 mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle size={15} className="text-amber-400" />
                <h3 className="text-sm font-bold text-white font-mono">
                  Live Disruption Signals
                </h3>
              </div>
              <Link
                to="/disruptions"
                className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:underline"
              >
                <span>Inspect Log</span>
                <ExternalLink size={11} />
              </Link>
            </div>

            <div className="flex flex-col gap-3 font-mono text-xs">
              
              {/* Signal 1: Mumbai Port Congestion */}
              <div className="p-3 rounded-lg bg-slate-900/80 border border-rose-500/25 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="stitch-pill stitch-pill-danger text-[9px] px-1.5 py-0.5">HIGH SEVERITY</span>
                  <span className="text-[10px] text-slate-400">08m ago</span>
                </div>
                <div className="font-bold text-sm text-white font-sans">
                  Mumbai Port Congestion
                </div>
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                  Inbound berth wait +44h detected. Surge tied to regional monsoon warnings.
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px]">
                  <span className="text-slate-300">Vessels Impacted: 6</span>
                  <Link to="/rerouting" className="text-cyan-400 hover:underline font-bold">
                    Simulate bypass →
                  </Link>
                </div>
              </div>

              {/* Signal 2: Dubai Jebel Ali Weather Warning */}
              <div className="p-3 rounded-lg bg-slate-900/80 border border-amber-500/25 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="stitch-pill stitch-pill-warning text-[9px] px-1.5 py-0.5">MODERATE</span>
                  <span className="text-[10px] text-slate-400">24m ago</span>
                </div>
                <div className="font-bold text-sm text-white font-sans">
                  Dubai Jebel Ali Weather Warning
                </div>
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                  Sustained crosswind speeds &gt;38 knots slowing gantry crane operation.
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px]">
                  <span className="text-slate-300">Speed reduction: -22%</span>
                  <span className="text-slate-400 hover:text-cyan-400 cursor-pointer">
                    View AIS trace
                  </span>
                </div>
              </div>

              {/* Signal 3: Singapore Transshipment */}
              <div className="p-3 rounded-lg bg-slate-900/80 border border-emerald-500/25 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="stitch-pill stitch-pill-success text-[9px] px-1.5 py-0.5">OPTIMAL PASS</span>
                  <span className="text-[10px] text-slate-400">1h ago</span>
                </div>
                <div className="font-bold text-sm text-white font-sans">
                  Singapore Transshipment
                </div>
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                  Seamless green corridor verified with immediate slot allocation clearance.
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px]">
                  <span className="text-emerald-400 font-semibold">Free slots: 14 TEU bays</span>
                  <span className="text-slate-400 hover:text-cyan-400 cursor-pointer">
                    Designate route
                  </span>
                </div>
              </div>

            </div>

            {/* Bottom Status Note */}
            <div className="mt-3 pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-400" />
                LangGraph Auto-Arbitration
              </span>
              <span className="text-slate-500">Standby</span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}