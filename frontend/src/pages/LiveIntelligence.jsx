import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  ExternalLink,
  MapPin,
  Radio,
  RefreshCw,
} from "lucide-react";

import {
  getLiveWeather,
  getLiveNews,
} from "../api/live";

function LiveIntelligence() {
  const [weather, setWeather] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("all");
  const [viewMode, setViewMode] = useState("live"); // 'live' | 'error' | 'empty'

  const loadFeeds = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [weatherRes, newsRes] = await Promise.allSettled([
        getLiveWeather("SGP"),
        getLiveNews({ query: "maritime shipping" }),
      ]);

      if (weatherRes.status === "fulfilled") {
        setWeather(weatherRes.value?.items || weatherRes.value || []);
      }
      if (newsRes.status === "fulfilled") {
        setNews(newsRes.value?.items || newsRes.value || []);
      }
    } catch (err) {
      setError(err.message || "Failed to load live external telemetry.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    async function init() {
      if (active) {
        await loadFeeds();
      }
    }
    init();
    return () => {
      active = false;
    };
  }, [loadFeeds]);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 font-sans">

      {/* =========================================================
          PAGE HEADER BANNER (IMAGE 2 MATCH)
          ========================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#38bdf8] uppercase tracking-wider mb-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              TELEMETRY STREAM ACTIVE
            </span>
            <span>•</span>
            <span className="text-[var(--text-muted)]">{loading ? "Syncing telemetry..." : "Feed Status: Connected • Sample Demonstration Data"}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Live External Signals
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1 font-mono">
            Real-time telemetry, maritime notices, and meteorological feeds covering key logistics nodes: Mumbai, Dubai, Singapore, and Rotterdam.
          </p>
        </div>

        {/* Top Metrics Box */}
        <div className="bg-[var(--bg-panel-soft)] border border-[var(--border-color)] rounded-xl p-3 flex items-center gap-6 font-mono text-xs">
          <div>
            <div className="text-[10px] text-[var(--text-muted)] uppercase">Monitored Nodes</div>
            <div className="text-xl font-extrabold text-[var(--text-primary)]">4</div>
          </div>
          <div className="w-[1px] h-8 bg-[var(--border-color)]" />
          <div>
            <div className="text-[10px] text-[var(--text-muted)] uppercase">Active Alerts</div>
            <div className="text-xl font-extrabold text-[#38bdf8]">7</div>
          </div>
          <div className="w-[1px] h-8 bg-[var(--border-color)]" />
          <div>
            <div className="text-[10px] text-[var(--text-muted)] uppercase">Avg Ingest Latency</div>
            <div className="text-xl font-extrabold text-emerald-400">18ms</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-400 font-mono">
          {error}
        </div>
      )}

      {/* =========================================================
          4 PORT NODE CARDS GRID (IMAGE 2 MATCH)
          ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Node 1 */}
        <div className="stitch-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="stitch-pill bg-slate-900 border-slate-700 text-slate-300 text-[10px]">Node BDM-01</span>
            <span className="w-2 h-2 rounded-full bg-blue-400" />
          </div>
          <div className="font-bold text-base text-[var(--text-primary)] mb-1">
            Mumbai (JNPT)
          </div>
          <p className="text-xs text-[var(--text-muted)] font-mono">Dredging Protocol Active</p>
        </div>

        {/* Node 2 */}
        <div className="stitch-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="stitch-pill bg-slate-900 border-slate-700 text-slate-300 text-[10px]">Node DXB-04</span>
            <span className="w-2 h-2 rounded-full bg-blue-400" />
          </div>
          <div className="font-bold text-base text-[var(--text-primary)] mb-1">
            Dubai (Jebel Ali)
          </div>
          <p className="text-xs text-amber-400 font-mono">Quay Dwell Surge (+14h)</p>
        </div>

        {/* Node 3 */}
        <div className="stitch-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="stitch-pill bg-slate-900 border-slate-700 text-slate-300 text-[10px]">Node SIN-02</span>
            <span className="w-2 h-2 rounded-full bg-blue-400" />
          </div>
          <div className="font-bold text-base text-[var(--text-primary)] mb-1">
            Singapore Hub
          </div>
          <p className="text-xs text-[var(--text-muted)] font-mono">Anchorage Showers (4km Vis)</p>
        </div>

        {/* Node 4 */}
        <div className="stitch-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="stitch-pill bg-slate-900 border-slate-700 text-slate-300 text-[10px]">Node RTM-01</span>
            <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
          </div>
          <div className="font-bold text-base text-[var(--text-primary)] mb-1">
            Rotterdam Gateway
          </div>
          <p className="text-xs text-rose-400 font-mono font-bold">Corridor Risk Re-routing</p>
        </div>

      </div>

      {/* =========================================================
          TABS & VIEW MODE BAR (IMAGE 2 MATCH)
          ========================================================= */}
      <div className="bg-[var(--bg-panel-soft)] border border-[var(--border-color)] rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs">
        
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-[var(--bg-panel)] border border-[var(--border-color)] p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setTab("all")}
            className={`px-3 py-1 rounded font-bold transition-all ${
              tab === "all" ? "bg-[#38bdf8]/15 text-[#38bdf8]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            All Signals (7)
          </button>
          <button
            type="button"
            onClick={() => setTab("news")}
            className={`px-3 py-1 rounded font-bold transition-all ${
              tab === "news" ? "bg-[#38bdf8]/15 text-[#38bdf8]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            Maritime News ({news.length || 4})
          </button>
          <button
            type="button"
            onClick={() => setTab("weather")}
            className={`px-3 py-1 rounded font-bold transition-all ${
              tab === "weather" ? "bg-[#38bdf8]/15 text-[#38bdf8]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            Port Weather ({weather.length || 3})
          </button>
        </div>

        {/* View Mode Selectors */}
        <div className="flex items-center gap-2">
          <span className="text-[var(--text-muted)]">View Mode:</span>
          <button
            type="button"
            onClick={() => setViewMode("live")}
            className={`px-3 py-1 rounded font-bold transition-all ${
              viewMode === "live" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "text-[var(--text-muted)] border border-transparent"
            }`}
          >
            ● Live Stream (5 active)
          </button>
          <button
            type="button"
            onClick={() => setViewMode("error")}
            className={`px-3 py-1 rounded font-bold transition-all ${
              viewMode === "error" ? "bg-rose-500/15 text-rose-400 border border-rose-500/30" : "text-[var(--text-muted)] border border-transparent"
            }`}
          >
            View Mock Error State
          </button>
          <button
            type="button"
            onClick={() => setViewMode("empty")}
            className={`px-3 py-1 rounded font-bold transition-all ${
              viewMode === "empty" ? "bg-slate-700/50 text-slate-300 border border-slate-600" : "text-[var(--text-muted)] border border-transparent"
            }`}
          >
            View Empty State
          </button>
        </div>

      </div>

      {/* =========================================================
          2X2 SIGNAL CARDS GRID (IMAGE 2 MATCH)
          ========================================================= */}
      {viewMode === "live" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Card 1 */}
          <div className="stitch-card p-5 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between mb-2 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="stitch-pill stitch-pill-blue text-[9px]">Live external signal</span>
                  <span className="stitch-pill stitch-pill-danger text-[9px]">Severe Severity</span>
                </div>
                <span className="text-[var(--text-muted)]">38 mins ago</span>
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">
                Red Sea Navigational Hazard Warning
              </h3>
              <div className="flex items-center gap-1 text-xs text-[var(--text-muted)] font-mono mb-3">
                <Radio size={12} className="text-[#38bdf8]" />
                <span>Source: UK Maritime Trade Operations (UKMTO)</span>
              </div>
              <div className="bg-[var(--bg-panel-soft)] border border-[var(--border-color)] rounded-lg p-3 font-mono text-xs flex justify-between mb-3">
                <span className="flex items-center gap-1 text-[var(--text-secondary)]">
                  <MapPin size={12} className="text-[#38bdf8]" />
                  Bab-el-Mandeb Strait / Red Sea Approach
                </span>
                <span className="text-[var(--text-muted)] font-bold">Zone 4A</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Merchant vessels advised to maintain heightened watch and comply with international transit corridor protocols. Average transit delays extended by 36-72 hours.
              </p>
            </div>
            <div className="border-t border-[var(--border-color)] pt-3 flex items-center justify-between font-mono text-xs">
              <span className="text-[var(--text-muted)]">Corridor Impact: <strong className="text-[var(--text-primary)]">Dubai / Rotterdam corridor</strong></span>
              <a href="#ukmto" className="flex items-center gap-1 text-[#38bdf8] font-bold hover:underline">
                <span>Source Advisory #2025-081</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* Card 2 */}
          <div className="stitch-card p-5 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between mb-2 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="stitch-pill stitch-pill-blue text-[9px]">Live external signal</span>
                  <span className="stitch-pill stitch-pill-warning text-[9px]">Moderate Severity</span>
                </div>
                <span className="text-[var(--text-muted)]">2 hrs ago</span>
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">
                Dubai (Jebel Ali) Terminal Quay Congestion
              </h3>
              <div className="flex items-center gap-1 text-xs text-[var(--text-muted)] font-mono mb-3">
                <Radio size={12} className="text-[#38bdf8]" />
                <span>Source: DP World Port Operation Portal</span>
              </div>
              <div className="bg-[var(--bg-panel-soft)] border border-[var(--border-color)] rounded-lg p-3 font-mono text-xs flex justify-between mb-3">
                <span className="flex items-center gap-1 text-[var(--text-secondary)]">
                  <MapPin size={12} className="text-[#38bdf8]" />
                  Jebel Ali Terminal 2 &amp; 3
                </span>
                <span className="text-[var(--text-muted)] font-bold">Berth 11-18</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Temporary berth congestion due to weekend container surge. Average waiting time for feeder vessels is 14 hours; main line container vessels prioritized.
              </p>
            </div>
            <div className="border-t border-[var(--border-color)] pt-3 flex items-center justify-between font-mono text-xs">
              <span className="text-[var(--text-muted)]">Port Hub: <strong className="text-[var(--text-primary)]">Dubai (DXB)</strong></span>
              <a href="#dpw" className="flex items-center gap-1 text-[#38bdf8] font-bold hover:underline">
                <span>DPW Operational Log</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* Card 3 */}
          <div className="stitch-card p-5 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between mb-2 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="stitch-pill stitch-pill-blue text-[9px]">Live external signal</span>
                  <span className="stitch-pill stitch-pill-success text-[9px]">Low / Normal Severity</span>
                </div>
                <span className="text-[var(--text-muted)]">4 hrs ago</span>
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">
                Singapore Port Marine Weather Advisory
              </h3>
              <div className="flex items-center gap-1 text-xs text-[var(--text-muted)] font-mono mb-3">
                <Radio size={12} className="text-[#38bdf8]" />
                <span>Source: Singapore Meteorological Service</span>
              </div>
              <div className="bg-[var(--bg-panel-soft)] border border-[var(--border-color)] rounded-lg p-3 font-mono text-xs flex justify-between mb-3">
                <span className="flex items-center gap-1 text-[var(--text-secondary)]">
                  <MapPin size={12} className="text-[#38bdf8]" />
                  Eastern Anchorage &amp; Jurong Island
                </span>
                <span className="text-[var(--text-muted)] font-bold">Sector East</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Passing afternoon thundershowers with localized visibility reduction to 4 km. No operational suspension required for gantry cranes or pilot boarding.
              </p>
            </div>
            <div className="border-t border-[var(--border-color)] pt-3 flex items-center justify-between font-mono text-xs">
              <span className="text-[var(--text-muted)]">Port Hub: <strong className="text-[var(--text-primary)]">Singapore (SIN)</strong></span>
              <a href="#mms" className="flex items-center gap-1 text-[#38bdf8] font-bold hover:underline">
                <span>MMS Weather Bull. #14</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* Card 4 */}
          <div className="stitch-card p-5 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between mb-2 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="stitch-pill stitch-pill-blue text-[9px]">Live external signal</span>
                  <span className="stitch-pill text-[9px]">Low / Informational</span>
                </div>
                <span className="text-[var(--text-muted)]">6 hrs ago</span>
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">
                Mumbai Port (JNPT) Approach Channel Dredging Update
              </h3>
              <div className="flex items-center gap-1 text-xs text-[var(--text-muted)] font-mono mb-3">
                <Radio size={12} className="text-[#38bdf8]" />
                <span>Source: Jawaharlal Nehru Port Authority Notice</span>
              </div>
              <div className="bg-[var(--bg-panel-soft)] border border-[var(--border-color)] rounded-lg p-3 font-mono text-xs flex justify-between mb-3">
                <span className="flex items-center gap-1 text-[var(--text-secondary)]">
                  <MapPin size={12} className="text-[#38bdf8]" />
                  Nhava Sheva Channel
                </span>
                <span className="text-[var(--text-muted)] font-bold">Draft: 14.5m max</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Maintenance dredging scheduled in north fairway. Draft limits unchanged at 14.5m. Two-way navigation active with harbor master advisory in effect.
              </p>
            </div>
            <div className="border-t border-[var(--border-color)] pt-3 flex items-center justify-between font-mono text-xs">
              <span className="text-[var(--text-muted)]">Port Hub: <strong className="text-[var(--text-primary)]">Mumbai (BDM)</strong></span>
              <a href="#jnpa" className="flex items-center gap-1 text-[#38bdf8] font-bold hover:underline">
                <span>JNPA Gazette #049/25</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

        </div>
      )}

      {/* =========================================================
          SYSTEM STATE PREVIEWS SECTION (IMAGE 2 MATCH)
          ========================================================= */}
      <div className="flex flex-col gap-4 border-t border-[var(--border-color)] pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold font-mono text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
            <Radio size={15} className="text-[#38bdf8]" />
            System State Previews
          </h2>
          <span className="text-xs font-mono text-[var(--text-muted)]">
            Fault tolerance and empty edge cases standard display
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Feed Error Handling Example */}
          <div className="stitch-card p-5 flex flex-col justify-between gap-4 border-rose-500/30">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="stitch-label text-rose-400">FEED ERROR HANDLING EXAMPLE</span>
                <span className="stitch-pill stitch-pill-danger text-[10px]">Degraded Link</span>
              </div>
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-start gap-3 text-xs font-mono text-rose-400 mb-3">
                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Weather API Feed - Rotterdam Hub:</div>
                  <div className="text-[11px] opacity-90 mt-0.5">
                    Connection timeout after 3 retries. Fallback: displaying cached observation from 2 hours ago.
                  </div>
                  <button type="button" onClick={loadFeeds} className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded bg-rose-500/20 border border-rose-500/40 font-bold hover:bg-rose-500/30 text-white transition-colors">
                    <RefreshCw size={12} />
                    <span>Retry Connection</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="text-[11px] text-[var(--text-muted)] font-mono">
              Behavior: Automatically flags feed source as stale and falls back to last verified AIS/Meteo snapshot.
            </div>
          </div>

          {/* Empty State Example */}
          <div className="stitch-card p-5 flex flex-col justify-between gap-4 border-emerald-500/30">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="stitch-label text-emerald-400">EMPTY STATE EXAMPLE</span>
                <span className="stitch-pill stitch-pill-success text-[10px]">Nominal Status</span>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-start gap-3 text-xs font-mono text-emerald-400 mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] mt-1 shrink-0" />
                <div>
                  <div className="font-bold">Western Mediterranean Corridor</div>
                  <div className="text-[11px] opacity-90 mt-0.5">
                    No active storm warnings for Western Mediterranean. All clear.
                  </div>
                </div>
              </div>
            </div>
            <div className="text-[11px] text-[var(--text-muted)] font-mono">
              Behavior: Suppresses noise when operational risk indicators remain inside nominal thresholds (&lt; 0.05 index).
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

export default LiveIntelligence;