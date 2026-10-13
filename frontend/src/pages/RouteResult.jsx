import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";

function RouteResult() {
  const [selectedDecision, setSelectedDecision] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 font-sans max-w-6xl mx-auto">

      {/* Top Back Link & Voyage Ref */}
      <div className="flex items-center justify-between font-mono text-xs text-[var(--text-muted)] border-b border-[var(--border-color)] pb-3">
        <Link
          to="/routes"
          className="flex items-center gap-1 text-[var(--accent-cyan)] font-bold hover:underline"
        >
          <ArrowLeft size={14} />
          <span>Back to route check</span>
        </Link>
        <div>
          <span>VOYAGE REFERENCE: </span>
          <strong className="text-[var(--text-primary)]">SIM-ROT-8842-E</strong>
        </div>
      </div>

      {/* Main Title Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="stitch-pill stitch-pill-blue text-[10px]">● DISRUPTION ADVISORY ACTIVE</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Route Evaluation: Singapore → Rotterdam
          </h1>
          <p className="text-xs font-mono text-[var(--text-muted)] mt-1">
            Carried cargo: 4,200 TEU mixed manufactured dry goods • Scheduled Arrival: Oct 28
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="stitch-pill bg-slate-900 border-slate-700 text-slate-300">
            Primary Passage: Red Sea / Suez
          </span>
          <span className="stitch-pill stitch-pill-blue">
            Vessel Telemetry: 19.4 kts • On Course
          </span>
        </div>
      </div>

      {/* =========================================================
          STEP 1: WHAT HAPPENED? (IMAGE 5 MATCH)
          ========================================================= */}
      <div className="stitch-card p-6 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-500/20 text-[#38bdf8] flex items-center justify-center text-xs font-mono">1</span>
            What happened?
          </h2>
          <span className="stitch-pill stitch-pill-blue text-[10px]">⚡ External Maritime Signal</span>
        </div>

        <div className="bg-[var(--bg-panel-soft)] border border-[var(--border-color)] rounded-xl p-4 text-sm text-[var(--text-secondary)] leading-relaxed font-sans">
          A maritime alert and severe congestion near the Bab-el-Mandeb Strait are creating multi-day vessel bottlenecks for ships heading toward the Suez Canal.
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-xs text-[var(--text-muted)]">
          <div>
            Source: UK Maritime Trade Operations (UKMTO) • Updated 2 hours ago • Live weather/news signal
          </div>
          <div>Incident ID: UKMTO-2024-N-0914</div>
        </div>
      </div>

      {/* =========================================================
          STEP 2: DOES IT AFFECT MY ROUTE? (IMAGE 5 MATCH)
          ========================================================= */}
      <div className="stitch-card p-6 flex flex-col gap-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-500/20 text-[#38bdf8] flex items-center justify-center text-xs font-mono">2</span>
          Does it affect my route?
        </h2>

        {/* Alert Container */}
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 font-mono">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-500 text-white font-extrabold flex items-center justify-center text-sm">
              Yes
            </div>
            <div>
              <div className="text-xs text-rose-400 font-bold uppercase flex items-center gap-1.5">
                <AlertTriangle size={14} />
                <span>ROUTE IMPACT: HIGH DELAY RISK</span>
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                Direct corridor intersection detected in active transit window.
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-right">
            <div className="text-[10px] text-slate-400 uppercase">Estimated Schedule Slip</div>
            <div className="text-lg font-extrabold text-rose-400">+4 to +6 Days</div>
          </div>
        </div>

        <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-mono">
          Your scheduled journey from Singapore to Rotterdam normally passes directly through the Red Sea. Current queue times add an estimated <strong className="text-[var(--text-primary)]">+4 to +6 days</strong> to your planned arrival date.
        </p>

        <div className="text-[11px] text-[var(--text-muted)] font-mono bg-slate-950/40 p-3 rounded-lg border border-[var(--border-color)]">
          ℹ Risk note: This risk estimate is calculated from rule-based port delay thresholds and reported convoy slowdowns (not automated predictive AI).
        </div>
      </div>

      {/* =========================================================
          STEP 3: WHAT CAN I DO? (IMAGE 5 MATCH SIDE-BY-SIDE CARDS)
          ========================================================= */}
      <div className="stitch-card p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-500/20 text-[#38bdf8] flex items-center justify-center text-xs font-mono">3</span>
            What can I do?
          </h2>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-[var(--text-muted)]">Compare your options</span>
            <span className="stitch-pill">Fixed fuel index: $620 / MT</span>
          </div>
        </div>

        {/* 2 Options Side-by-Side Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* OPTION A: VIA SUEZ CANAL */}
          <div className="bg-[var(--bg-panel-soft)] border border-[var(--border-color)] rounded-xl p-5 flex flex-col justify-between gap-5 font-mono text-xs">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="stitch-label">OPTION A</span>
                <span className="stitch-pill text-[10px]">Active scheduled route</span>
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)]">
                Via Suez Canal
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Standard Route</p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] p-3 rounded-lg">
                <div className="stitch-label">Estimated Transit Time</div>
                <div className="text-2xl font-extrabold text-[var(--text-primary)] mt-0.5">
                  24 days <span className="text-xs font-semibold text-rose-400">(+4 to +6 days delay likely)</span>
                </div>
              </div>

              <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] p-3 rounded-lg">
                <div className="stitch-label">Estimated Cost</div>
                <div className="text-2xl font-extrabold text-[var(--text-primary)] mt-0.5">
                  $148,000
                </div>
                <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                  Includes Suez canal toll ($92,000) and standard bunker fuel ($56,000).
                </div>
              </div>

              <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] p-3 rounded-lg">
                <div className="stitch-label">Predictability / Risk</div>
                <div className="text-sm font-bold text-amber-400 flex items-center gap-1.5 mt-0.5">
                  <AlertTriangle size={14} />
                  <span>Elevated Risk</span>
                </div>
                <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                  High chance of open-ended anchorage waiting at southern gate.
                </div>
              </div>
            </div>

            <div className="text-[10px] text-amber-400 bg-amber-400/10 p-2.5 rounded border border-amber-400/20">
              Missing information notice: Real-time convoy queue status for tomorrow is currently unavailable from canal authority; using latest confirmed notice.
            </div>
          </div>

          {/* OPTION B: VIA CAPE OF GOOD HOPE (RECOMMENDED ALTERNATIVE) */}
          <div className="bg-[var(--bg-panel-soft)] border-2 border-[#0284c7] rounded-xl p-5 flex flex-col justify-between gap-5 font-mono text-xs relative shadow-[0_0_25px_rgba(2,132,199,0.15)]">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="stitch-label text-[#38bdf8]">OPTION B</span>
                <span className="stitch-pill stitch-pill-blue text-[10px] font-bold">
                  ★ Recommended alternative
                </span>
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)]">
                Via Cape of Good Hope
              </h3>
              <p className="text-xs text-[#38bdf8] mt-0.5">Southern Bypass</p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] p-3 rounded-lg">
                <div className="stitch-label">Estimated Transit Time</div>
                <div className="text-2xl font-extrabold text-[var(--text-primary)] mt-0.5">
                  28 days <span className="text-xs font-semibold text-[var(--text-muted)]">(predictable schedule, open ocean passage)</span>
                </div>
              </div>

              <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] p-3 rounded-lg">
                <div className="stitch-label">Estimated Cost</div>
                <div className="text-2xl font-extrabold text-[var(--text-primary)] mt-0.5">
                  $162,000
                </div>
                <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                  +$14,000 extra fuel; zero canal toll charges.
                </div>
              </div>

              <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] p-3 rounded-lg">
                <div className="stitch-label">Predictability / Risk</div>
                <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
                  <ShieldCheck size={14} />
                  <span>Low Risk</span>
                </div>
                <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                  Reliable schedule with no chokepoint checkpoints or queue lines.
                </div>
              </div>
            </div>

            <div className="bg-[#0284c7]/10 border border-[#0284c7]/30 p-3 rounded-lg text-xs text-[var(--text-primary)]">
              <span className="font-bold text-[#38bdf8]">SUMMARY TRADEOFF: </span>
              Adds 4 scheduled sailing days and $14,000 in fuel, but avoids unpredictable Red Sea bottleneck delays.
            </div>
          </div>

        </div>

        {/* Expandable Details Accordion */}
        <div className="border-t border-[var(--border-color)] pt-4">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center justify-between w-full text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <div className="flex items-center gap-2 font-bold">
              <ChevronDown size={14} className={`transition-transform ${showDetails ? "rotate-180" : ""}`} />
              <span>More details (mileage, insurance differential, carbon index)</span>
            </div>
            <span className="stitch-pill text-[9px]">Contract Metrics</span>
          </button>

          {showDetails && (
            <div className="mt-3 p-4 bg-[var(--bg-panel-soft)] border border-[var(--border-color)] rounded-lg text-xs font-mono grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="stitch-label">DISTANCE DIFFERENTIAL</span>
                <div className="font-bold text-[var(--text-primary)] mt-1">+3,500 nautical miles</div>
              </div>
              <div>
                <span className="stitch-label">INSURANCE PREMIUM SAVINGS</span>
                <div className="font-bold text-emerald-400 mt-1">-$8,500 war-risk surcharge</div>
              </div>
              <div>
                <span className="stitch-label">CARBON IMPACT</span>
                <div className="font-bold text-[var(--text-primary)] mt-1">+12% CO2 total emissions</div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* =========================================================
          STEP 4: OPERATOR DECISION (IMAGE 5 MATCH)
          ========================================================= */}
      <div className="stitch-card p-6 flex flex-col gap-6">
        <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-500/20 text-[#38bdf8] flex items-center justify-center text-xs font-mono">4</span>
          Operator Decision
        </h2>
        <p className="text-xs font-mono text-[var(--text-muted)]">
          SupplyChainAI never reroutes automatically. Please choose an action for the dispatch team to log:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Option 1 Button */}
          <button
            type="button"
            onClick={() => setSelectedDecision("alternative")}
            className={`p-5 rounded-xl border flex items-center justify-between text-left transition-all ${
              selectedDecision === "alternative"
                ? "bg-[#0284c7] text-white border-[#38bdf8] shadow-[0_0_20px_rgba(2,132,199,0.4)]"
                : "bg-[#0284c7] hover:bg-[#0369a1] text-white border-transparent"
            }`}
          >
            <div>
              <div className="font-bold text-base">Review this alternative</div>
              <div className="text-xs opacity-90 font-mono mt-1">
                Cape Bypass • Proceed to voyage revision plan
              </div>
            </div>
            <ArrowRight size={20} />
          </button>

          {/* Option 2 Button */}
          <button
            type="button"
            onClick={() => setSelectedDecision("keep")}
            className={`p-5 rounded-xl border flex items-center justify-between text-left transition-all ${
              selectedDecision === "keep"
                ? "bg-slate-800 border-emerald-400 text-white shadow-[0_0_20px_rgba(52,211,153,0.3)]"
                : "bg-[var(--bg-panel-soft)] hover:bg-slate-800/80 border-[var(--border-color)] text-[var(--text-primary)]"
            }`}
          >
            <div>
              <div className="font-bold text-base">Keep current route</div>
              <div className="text-xs text-[var(--text-muted)] font-mono mt-1">
                Suez Corridor • Acknowledge delay risk and maintain ETA
              </div>
            </div>
            <Check size={20} className="text-emerald-400" />
          </button>

        </div>

        {selectedDecision && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs font-mono text-emerald-400 flex items-center gap-2">
            <Check size={16} />
            <span>Decision recorded: {selectedDecision === "alternative" ? "Cape Bypass Selected" : "Suez Passage Maintained"}. Dispatch audit log updated.</span>
          </div>
        )}

        <div className="text-[11px] text-[var(--text-muted)] font-mono border-t border-[var(--border-color)] pt-3 flex items-center gap-1.5">
          <span>🔒 Logged to dispatch audit log for review • Example demonstration data</span>
        </div>
      </div>

    </div>
  );
}

export default RouteResult;
