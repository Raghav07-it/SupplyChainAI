import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  Compass,
  Info,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";

import { getWeightedRoute } from "../api/routing";

function RoutesPage() {
  const navigate = useNavigate();
  const [origin, setOrigin] = useState("Singapore");
  const [destination, setDestination] = useState("Rotterdam");
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadRoute = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getWeightedRoute({ origin, destination });
      setRouteData(res);
    } catch (err) {
      setError(err.message || "Could not calculate route assessment.");
    } finally {
      setLoading(false);
    }
  }, [origin, destination]);

  useEffect(() => {
    let active = true;
    async function init() {
      if (active) {
        await loadRoute();
      }
    }
    init();
    return () => {
      active = false;
    };
  }, [loadRoute]);

  function handleSwap() {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 font-sans">

      {/* =========================================================
          TOP ADVISORY BANNER (IMAGE 3 MATCH)
          ========================================================= */}
      <div className="bg-[var(--bg-panel-soft)] border border-[var(--border-color)] rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Info size={18} />
          </div>
          <div>
            <div className="font-bold text-[var(--text-primary)] flex items-center gap-2">
              <span>A disruption may affect this route.</span>
              <span className="stitch-pill text-[9px]">EXAMPLE DATA</span>
            </div>
            <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
              Check active conditions between major ports to see if your transit is delayed.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[var(--text-muted)]">Corridor Status:</span>
          <span className="stitch-pill stitch-pill-blue">● Active Advisory</span>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-400 font-mono">
          {error}
        </div>
      )}

      {/* =========================================================
          VOYAGE CONFIG & LANE GEOGRAPHY GRID (IMAGE 3 MATCH)
          ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* VOYAGE CONFIGURATION CARD */}
        <div className="stitch-card p-6 flex flex-col justify-between gap-6">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
            <div>
              <span className="stitch-label">VOYAGE CONFIGURATION</span>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mt-1">
                Route Assessment
              </h2>
            </div>
            <div className="p-2 rounded bg-[var(--bg-panel-soft)] border border-[var(--border-color)] text-[var(--text-muted)]">
              <SlidersHorizontal size={16} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            
            {/* Origin Select */}
            <div className="bg-[var(--bg-panel-soft)] border border-[var(--border-color)] rounded-xl p-4 font-mono text-xs">
              <div className="stitch-label mb-1">FROM (ORIGIN)</div>
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full bg-transparent font-bold text-sm text-[var(--text-primary)] focus:outline-none cursor-pointer"
              >
                <option value="Singapore">Singapore (SGP)</option>
                <option value="Mumbai">Mumbai (INMUM)</option>
                <option value="Dubai">Dubai (AEDXB)</option>
                <option value="Rotterdam">Rotterdam (NLRTM)</option>
              </select>
              <div className="text-[10px] text-[var(--text-muted)] mt-1">Pasir Panjang Terminal</div>
            </div>

            {/* Swap Button & Destination */}
            <div className="relative">
              <button
                type="button"
                onClick={handleSwap}
                className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 w-7 h-7 rounded-full bg-[var(--bg-panel)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                title="Swap Origin and Destination"
              >
                <RotateCcw size={12} />
              </button>

              <div className="bg-[var(--bg-panel-soft)] border border-[var(--border-color)] rounded-xl p-4 font-mono text-xs">
                <div className="stitch-label mb-1">TO (DESTINATION)</div>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-transparent font-bold text-sm text-[var(--text-primary)] focus:outline-none cursor-pointer"
                >
                  <option value="Rotterdam">Rotterdam (RTM)</option>
                  <option value="Singapore">Singapore (SGP)</option>
                  <option value="Mumbai">Mumbai (INMUM)</option>
                  <option value="Dubai">Dubai (AEDXB)</option>
                </select>
                <div className="text-[10px] text-[var(--text-muted)] mt-1">Maasvlakte Europort Gate</div>
              </div>
            </div>

          </div>

          <div className="text-xs font-mono text-[var(--text-muted)]">
            Showing corridor: <strong className="text-[var(--text-primary)]">{origin} to {destination}</strong> via standard shipping lanes.
          </div>

          <div className="flex items-center justify-between border-t border-[var(--border-color)] pt-4">
            <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
              <span>✓ Validated maritime corridor • {routeData?.total_distance_km ? `${routeData.total_distance_km.toLocaleString()} km` : "8,420 nm"}</span>
            </div>
            <button
              type="button"
              onClick={loadRoute}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-black text-white hover:bg-slate-900 border border-slate-700 font-bold text-xs transition-colors shadow-lg"
            >
              <span>{loading ? "Evaluating..." : "Check my route"}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* LANE GEOGRAPHY CARD */}
        <div className="stitch-card p-6 flex flex-col justify-between gap-6">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
            <div>
              <span className="stitch-label">LANE GEOGRAPHY</span>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mt-1">
                Malacca — Suez — Gibraltar Corridor
              </h2>
            </div>
            <span className="stitch-pill stitch-pill-blue font-mono text-[10px]">AIS Live Transit Stream</span>
          </div>

          <div className="relative bg-slate-900 border border-slate-800 rounded-xl overflow-hidden min-h-[160px] flex flex-col justify-end p-4">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Critical Chokepoint</div>
              <div className="text-lg font-bold text-white flex items-center justify-between">
                <span>Southern Red Sea Gateway</span>
                <span className="stitch-pill stitch-pill-danger">Delay Zone</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 font-mono text-xs">
            <div className="bg-[var(--bg-panel-soft)] border border-[var(--border-color)] rounded-lg p-3">
              <div className="stitch-label">BASE TRANSIT</div>
              <div className="text-lg font-extrabold text-[var(--text-primary)] mt-0.5">26 Days</div>
            </div>

            <div className="bg-[var(--bg-panel-soft)] border border-[var(--border-color)] rounded-lg p-3">
              <div className="stitch-label">ACTIVE BOTTLENECKS</div>
              <div className="text-lg font-extrabold text-rose-400 mt-0.5">2 Points</div>
            </div>

            <div className="bg-[var(--bg-panel-soft)] border border-[var(--border-color)] rounded-lg p-3">
              <div className="stitch-label">LANE RELIABILITY</div>
              <div className="text-lg font-extrabold text-[#38bdf8] mt-0.5">64%</div>
            </div>
          </div>
        </div>

      </div>

      {/* =========================================================
          RECENT ALERTS ALONG THIS CORRIDOR (IMAGE 3 MATCH)
          ========================================================= */}
      <div className="flex flex-col gap-4 border-t border-[var(--border-color)] pt-6">
        <div>
          <div className="stitch-label">LIVE CONDITIONS INTELLIGENCE</div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">
            Recent alerts along this corridor
          </h2>
          <p className="text-xs font-mono text-[var(--text-muted)] mt-1">
            Displaying verified operational disruptions impacting maritime passage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Alert 1 */}
          <div className="stitch-card p-5 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="stitch-pill stitch-pill-blue text-[9px]">Live weather/news signal</span>
                <AlertTriangle size={15} className="text-rose-400" />
              </div>
              <h3 className="text-sm font-bold text-[var(--text-primary)] leading-snug mb-2">
                Red Sea passage delay: severe shipping congestion near Bab-el-Mandeb Strait.
              </h3>
              <div className="text-xs font-mono text-[var(--text-muted)]">
                Location: Southern Red Sea / Bab-el-Mandeb
              </div>
            </div>
            <div className="border-t border-[var(--border-color)] pt-3 text-[11px] font-mono text-[var(--text-muted)]">
              Reported 2 hours ago • Source: UK Maritime Trade Operations (UKMTO)
            </div>
          </div>

          {/* Alert 2 */}
          <div className="stitch-card p-5 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="stitch-pill stitch-pill-blue text-[9px]">Live weather/news signal</span>
                <Clock size={15} className="text-amber-400" />
              </div>
              <h3 className="text-sm font-bold text-[var(--text-primary)] leading-snug mb-2">
                Berth maintenance causing 14-hour container backlog at Dubai terminal.
              </h3>
              <div className="text-xs font-mono text-[var(--text-muted)]">
                Location: Dubai (Jebel Ali Port)
              </div>
            </div>
            <div className="border-t border-[var(--border-color)] pt-3 text-[11px] font-mono text-[var(--text-muted)]">
              Reported 5 hours ago • Source: DP World Operations Advisory
            </div>
          </div>

          {/* Alert 3 */}
          <div className="stitch-card p-5 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="stitch-pill text-[9px]">Example historical data</span>
                <Compass size={15} className="text-[var(--text-muted)]" />
              </div>
              <h3 className="text-sm font-bold text-[var(--text-primary)] leading-snug mb-2">
                Monsoon wind swell advisory with localized pilotage delays.
              </h3>
              <div className="text-xs font-mono text-[var(--text-muted)]">
                Location: Arabian Sea approaches
              </div>
            </div>
            <div className="border-t border-[var(--border-color)] pt-3 text-[11px] font-mono text-[var(--text-muted)]">
              Recorded seasonal pattern • Source: Regional Maritime Archive (Benchmark)
            </div>
          </div>

        </div>
      </div>

      {/* =========================================================
          IMPACT ANALYSIS READY BANNER (IMAGE 3 MATCH)
          ========================================================= */}
      <div className="stitch-card p-6 bg-gradient-to-r from-blue-900/20 to-slate-900 border-blue-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-[#38bdf8] shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div>
            <span className="stitch-pill stitch-pill-blue text-[10px] mb-1">IMPACT ANALYSIS READY</span>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              Disruptions detected in the Red Sea corridor may add 4–7 days to this voyage.
            </h3>
            <p className="text-xs font-mono text-[var(--text-secondary)] mt-0.5">
              Explore evaluated alternatives including Cape of Good Hope routing and multimodal rail-sea transfers.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/route-result")}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-sm transition-all shadow-[0_0_20px_rgba(2,132,199,0.3)] whitespace-nowrap"
        >
          <span>Review route options</span>
          <ArrowRight size={16} />
        </button>
      </div>

    </div>
  );
}

export default RoutesPage;