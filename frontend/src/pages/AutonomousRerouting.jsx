import { useState, useEffect } from "react";
import {
  AlertTriangle,
  Anchor,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  Cpu,
  FastForward,
  Flame,
  Layers,
  MapPin,
  Maximize2,
  Navigation,
  RotateCw,
  Route,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import { getAutonomousRoute } from "../api/autonomous";

const PIPELINE_STEPS = [
  { id: "01", name: "DISRUPTION DETECTED", sub: "INMUM Berth Conge...", done: true },
  { id: "02", name: "RISK ASSESSED", sub: "Score: 72/100 (High)", done: true },
  { id: "03", name: "ROUTE EVALUATED", sub: "Schedule slip >48h", done: true },
  { id: "04", name: "ALTERNATIVES", sub: "3 Corridors synthesized", done: true },
  { id: "05", name: "PARETO COMPARED", sub: "Frontier calculated", done: true },
  { id: "06", name: "STEP 06 · PENDING", sub: "AI DECISION ACTIVE", sub2: "CORRIDOR B", active: true },
];

export default function AutonomousRerouting() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionExecuted, setActionExecuted] = useState(false);
  const [keepOriginal, setKeepOriginal] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const result = await getAutonomousRoute({
          originPortCode: "INMUM",
          destinationPortCode: "NLRTM",
        });
        setData(result);
      } catch {
        // Fallback default
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 font-sans">
      
      {/* =========================================================
          PAGE HEADER (IMAGE 2 MATCH)
          ========================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
        <div>
          <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] font-bold tracking-wider text-sky-400 uppercase mb-1">
            <span>● LANGGRAPH AUTONOMOUS PIPELINE · ACTIVE TRIGGER</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">ID: SC-9421-EVAL</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">AGENT: OPTIMUS-ROUTER-V4</span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400">SOLVE TIME: 318ms</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Autonomous Rerouting
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 max-w-4xl leading-relaxed">
            AI-assisted risk-aware route decision engine and explainable execution pipeline.
          </p>
        </div>
      </div>

      {/* =========================================================
          6-STEP DAG PIPELINE STEPPER (IMAGE 2 MATCH)
          ========================================================= */}
      <div className="stitch-card p-4 lg:p-5">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 relative">
          {PIPELINE_STEPS.map((step, idx) => (
            <div
              key={step.id}
              className={`flex flex-col items-center text-center p-2.5 rounded-xl border transition-all ${
                step.active
                  ? "bg-purple-950/30 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                  : "bg-slate-900/60 border-slate-800"
              }`}
            >
              <div className="flex items-center justify-center w-7 h-7 rounded-full mb-2 bg-slate-800 border border-slate-700">
                {step.done ? (
                  <CheckCircle2 size={16} className="text-emerald-400" />
                ) : (
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping" />
                )}
              </div>
              <span className="font-mono text-[9px] font-bold tracking-wider text-slate-400 uppercase">
                {step.name}
              </span>
              <span className={`font-mono text-[11px] font-bold mt-0.5 ${step.active ? "text-purple-300" : "text-slate-200"}`}>
                {step.sub}
              </span>
              {step.sub2 && (
                <span className="font-mono text-[10px] text-purple-400 font-bold mt-0.5">
                  {step.sub2}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================
          RECOMMENDED AUTONOMOUS ACTION HERO CARD (IMAGE 2 MATCH)
          ========================================================= */}
      <div className="stitch-card p-6 border-purple-500/30 bg-gradient-to-r from-[#0F172A] via-[#10192A] to-[#131128] relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-purple-500/5 to-transparent pointer-events-none" />

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-3 py-1 rounded bg-indigo-600 text-white font-mono text-[10px] font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(99,102,241,0.5)]">
            RECOMMENDED AUTONOMOUS ACTION
          </span>
          <span className="stitch-pill stitch-pill-success text-[10px]">
            Confidence 94.6%
          </span>
          <span className="stitch-pill bg-slate-900 border-slate-700 text-slate-400 text-[10px]">
            <Clock size={11} className="text-amber-400" />
            HITL Override Window: 04:18:19
          </span>
        </div>

        <h2 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-white tracking-tight font-sans">
          REROUTE SHIPMENT #SC-9421 VIA CORRIDOR B (SINGAPORE)
        </h2>
        <p className="text-xs md:text-sm text-slate-300 mt-2 max-w-4xl leading-relaxed">
          Automated agent has pre-cleared transshipment slots at PSA Singapore Terminal 3. Container carrier <strong className="text-white">MSC AURELIA (Voyage 884W)</strong> is reserved with 14 hours buffer window prior to feeder departure.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 mt-5">
          <button
            type="button"
            onClick={() => {
              setActionExecuted(true);
              setKeepOriginal(false);
            }}
            disabled={actionExecuted}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-mono text-xs font-bold transition-all shadow-[0_0_20px_rgba(2,132,199,0.4)] ${
              actionExecuted
                ? "bg-emerald-600 text-white cursor-default"
                : "bg-[#0284c7] hover:bg-[#0369a1] text-white"
            }`}
          >
            {actionExecuted ? <Check size={14} /> : <Zap size={14} />}
            <span>{actionExecuted ? "Autonomous Reroute Executed" : "Approve & Execute Autonomous Reroute"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setKeepOriginal(true);
              setActionExecuted(false);
            }}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-slate-300 hover:text-white font-mono text-xs font-semibold transition-colors"
          >
            <X size={14} />
            <span>Keep Current Route (Accept Delay Risk)</span>
          </button>
        </div>

        {actionExecuted && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 font-mono text-xs text-emerald-400 flex items-center gap-2">
            <CheckCircle2 size={14} />
            <span>Dispatch instruction EDI-9421-B transmitted to vessel bridge and PSA Singapore operations desk.</span>
          </div>
        )}
      </div>

      {/* =========================================================
          MAIN DUAL COLUMN BREAKDOWN
          Left Column (Why Decision Made + Log)
          Right Column (Corridor Comparison + Map + Trace)
          ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-6">

          {/* Section: WHY WAS THIS DECISION MADE? */}
          <div className="stitch-card p-5 lg:p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                WHY WAS THIS DECISION MADE?
              </h3>
              <span className="font-mono text-[10px] text-purple-400">
                LANGGRAPH SYNTHESIS V2.4
              </span>
            </div>

            {/* 4 Reason Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Reason 1 */}
              <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] font-bold text-emerald-400">
                      01 · RISK MITIGATION
                    </span>
                    <ShieldCheck size={14} className="text-emerald-400" />
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Eliminates exposure to Mumbai berth paralysis. Primary risk vectors neutralized:
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between font-mono">
                  <span className="text-rose-400 font-bold">72 → 28</span>
                  <span className="text-emerald-400 text-xs font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    -61.1% Risk
                  </span>
                </div>
              </div>

              {/* Reason 2 */}
              <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] font-bold text-cyan-400">
                      02 · NET TIME VELOCITY
                    </span>
                    <FastForward size={14} className="text-cyan-400" />
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Despite +4,720 nm longer geographic run, net arrival is accelerated by avoiding Suez and Dubai anchor waiting rooms.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between font-mono">
                  <span className="text-cyan-400 font-bold text-sm">44 hrs Saved</span>
                  <span className="text-slate-400 text-[10px]">ETA: -1.83 Days</span>
                </div>
              </div>

              {/* Reason 3 */}
              <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] font-bold text-amber-400">
                      03 · COST-BENEFIT DELTA
                    </span>
                    <Layers size={14} className="text-amber-400" />
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Fuel &amp; canal fee increase of +$35,700 (+10.4%) is 68% lower than anticipated container demurrage penalties ($112k) on Route A.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between font-mono">
                  <span className="text-emerald-400 font-bold text-sm">$76,300</span>
                  <span className="text-emerald-400 text-[10px]">Net Value Preserved</span>
                </div>
              </div>

              {/* Reason 4 */}
              <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] font-bold text-indigo-400">
                      04 · NODE RELIABILITY
                    </span>
                    <Anchor size={14} className="text-indigo-400" />
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Singapore transshipment terminal yard 3 currently operating at near-flawless throughput velocity with 0 congestion backlog reported.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between font-mono">
                  <span className="text-indigo-300 font-bold text-sm">99.1%</span>
                  <span className="text-indigo-300 text-[10px]">On-Time Yard TAT</span>
                </div>
              </div>

            </div>

            {/* Pareto Evaluation Matrix Progress Bar */}
            <div className="mt-2 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between font-mono text-[10px] text-slate-400 mb-2">
                <span>PARETO EVALUATION MATRIX (TRANSIT TIME VS TOTAL RISK VS COST VARIANCE)</span>
                <span className="text-cyan-400 font-bold">Optimality Frontier 98.2%</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                <div style={{ width: "35%" }} className="h-full bg-rose-500" title="Route A" />
                <div style={{ width: "50%" }} className="h-full bg-emerald-400" title="Route B (Approved)" />
                <div style={{ width: "15%" }} className="h-full bg-slate-600" title="Route C" />
              </div>
              <div className="flex items-center gap-4 mt-2 font-mono text-[9px] text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  Route A: Gulf Chokepoint (Dropped)
                </span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Route B: Malacca/PSA (Approved)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  Route C: Air Freight Split
                </span>
              </div>
            </div>

          </div>

          {/* Section: Autonomous Decision Log (Preceding 24h) */}
          <div className="stitch-card p-5 lg:p-6 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2">
                <RotateCw size={15} className="text-cyan-400" />
                <h3 className="text-sm font-bold text-white font-mono">
                  Autonomous Decision Log (Preceding 24h)
                </h3>
              </div>
              <span className="font-mono text-[10px] text-slate-400">
                4 automated reroutes executed
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="stitch-table font-mono text-xs">
                <thead>
                  <tr>
                    <th>SHIPMENT</th>
                    <th>ORIGIN / DEST</th>
                    <th>TRIGGER CAUSE</th>
                    <th>ACTION TAKEN</th>
                    <th>SAVINGS</th>
                    <th className="text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="text-cyan-400 font-bold">#SC-9390</td>
                    <td>SHG → LAX</td>
                    <td>Typhoon Gaemi</td>
                    <td>Great Circle North bypass</td>
                    <td className="text-emerald-400">+36h / $22k</td>
                    <td className="text-right">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                        EXECUTED
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="text-cyan-400 font-bold">#SC-9402</td>
                    <td>HAM → NYC</td>
                    <td>Antwerp Crane Strike</td>
                    <td>Diverted to Zeebrugge</td>
                    <td className="text-emerald-400">+18h / $14k</td>
                    <td className="text-right">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                        EXECUTED
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="text-cyan-400 font-bold">#SC-9418</td>
                    <td>SZX → DUB</td>
                    <td>Red Sea Security Zone</td>
                    <td>Cape of Good Hope reroute</td>
                    <td className="text-slate-400">-$18k / Safe</td>
                    <td className="text-right">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                        EXECUTED
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-6">

          {/* Section: Corridor Comparison */}
          <div className="stitch-card p-5 lg:p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="text-sm font-bold text-white font-mono">
                Corridor Comparison
              </h3>
              <span className="stitch-pill stitch-pill-success text-[10px]">
                Route B Dominates Pareto
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              
              {/* Route A (Current) */}
              <div className="rounded-xl bg-slate-900/90 border border-rose-500/30 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="font-mono text-xs font-bold text-rose-400">CURRENT ROUTE (A)</span>
                    <AlertTriangle size={14} className="text-rose-400" />
                  </div>
                  <div className="font-mono text-[11px] text-slate-300 my-2">
                    Mumbai → Dubai → Rotterdam
                  </div>
                  <div className="space-y-2 font-mono text-xs pt-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Duration:</span>
                      <span className="text-white font-bold">486 hrs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Cost:</span>
                      <span className="text-white font-bold">$342,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Risk Index:</span>
                      <span className="text-rose-400 font-bold">72 - High</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Demurrage Risk:</span>
                      <span className="text-rose-400 font-bold">$112,000</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-800 flex items-center gap-1.5 text-rose-400 font-mono text-[10px]">
                  <X size={12} />
                  <span>Suez queue backlog +74h</span>
                </div>
              </div>

              {/* Route B (Alternative) */}
              <div className="rounded-xl bg-slate-900/90 border border-emerald-500/40 p-4 flex flex-col justify-between shadow-[0_0_15px_rgba(52,211,153,0.1)]">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="font-mono text-xs font-bold text-emerald-400">ALTERNATIVE (B)</span>
                    <CheckCircle2 size={14} className="text-emerald-400" />
                  </div>
                  <div className="font-mono text-[11px] text-emerald-300 font-semibold my-2">
                    Mumbai → Singapore → Rotterdam
                  </div>
                  <div className="space-y-2 font-mono text-xs pt-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Duration:</span>
                      <span className="text-emerald-400 font-bold">442 hrs (-44h)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Cost:</span>
                      <span className="text-white font-bold">$377,700</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Risk Index:</span>
                      <span className="text-emerald-400 font-bold">28 - Low</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Demurrage Risk:</span>
                      <span className="text-emerald-400 font-bold">$0 (Zero wait)</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-800 flex items-center gap-1.5 text-emerald-400 font-mono text-[10px] font-semibold">
                  <Check size={12} />
                  <span>Guaranteed berth at PSA T3</span>
                </div>
              </div>

            </div>
          </div>

          {/* Section: Arabian Sea Diversion Waypoint (GIS Map Graphic) */}
          <div className="stitch-card p-5 lg:p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2">
                <Compass size={15} className="text-cyan-400" />
                <h3 className="text-sm font-bold text-white font-mono">
                  Arabian Sea Diversion Waypoint
                </h3>
              </div>
              <span className="font-mono text-[10px] text-slate-400">
                GIS Real-Time 12.4°N, 64.8°E
              </span>
            </div>

            <div className="relative my-3 rounded-xl bg-[#070b12] border border-slate-800 p-4 min-h-[220px] flex flex-col justify-between overflow-hidden">
              {/* Map background illustration */}
              <div className="absolute inset-0 opacity-40 pointer-events-none">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <rect width="100%" height="100%" fill="#070b12" />
                  {/* Dashed orange original trajectory */}
                  <path
                    d="M 50 180 Q 150 120 280 80"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2.5"
                    strokeDasharray="5 4"
                  />
                  {/* Teal diversion trajectory curve */}
                  <path
                    d="M 50 180 Q 220 200 380 140"
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="3.5"
                    filter="drop-shadow(0 0 8px rgba(6, 182, 212, 0.8))"
                  />
                </svg>
              </div>

              {/* Waypoint Legend */}
              <div className="relative z-10 flex items-center gap-4 text-[10px] font-mono">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  ORIGINAL PATH (Blocked)
                </span>
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  DIVERSION TRAJECTORY
                </span>
              </div>

              {/* Overlay Waypoint Box */}
              <div className="relative z-10 mt-6 bg-slate-900/90 border border-slate-700/80 rounded-lg p-3 max-w-sm backdrop-blur-md">
                <div className="font-mono text-[10px] text-cyan-400 font-bold mb-0.5">
                  WAYPOINT #4 - BETA
                </div>
                <p className="text-[11px] text-slate-200 font-sans leading-tight">
                  Diverting south of Sri Lanka towards Straits of Malacca.
                </p>
                <div className="text-[10px] font-mono text-emerald-400 font-bold mt-1">
                  Current Speed: 19.4 knots
                </div>
              </div>

              {/* Footer info */}
              <div className="relative z-10 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400 mt-2">
                <span>Vessel: MSC AURELIA (IMO 9745281)</span>
                <span className="text-cyan-400">Next AIS Ping: 42s</span>
              </div>
            </div>
          </div>

          {/* Section: LangGraph Node Trace */}
          <div className="stitch-card p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2.5">
              <span className="font-mono text-xs font-bold text-white tracking-wider uppercase">
                LANGGRAPH NODE TRACE
              </span>
              <span className="font-mono text-[10px] text-emerald-400 font-bold">
                ALL NODES NOMINAL
              </span>
            </div>

            <div className="rounded-lg bg-[#060a12] border border-slate-800 p-3 font-mono text-[11px] text-emerald-400/90 space-y-1.5 overflow-x-auto leading-relaxed">
              <div>[14:02:11] node.disruption_scanner: INMUM harbor congestion confirmed. Delta: +46h</div>
              <div>[14:02:12] node.corridor_generator: 3 viable pathways generated across Malacca / Suez</div>
              <div>[14:02:13] node.risk_model: Bayesian probability index evaluated. Corridor B score: 0.892</div>
              <div>[14:02:14] node.decision_arbiter: Action proposed: Reroute to Corridor B via PSA T3</div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}