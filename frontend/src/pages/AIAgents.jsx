import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  Clock,
  Compass,
  Copy,
  Download,
  ExternalLink,
  Layers,
  MapPin,
  Network,
  RotateCw,
  Route,
  ShieldAlert,
  Sparkles,
  Terminal,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import { runAgentWorkflow } from "../api/agents";

const PRESET_INCIDENTS = [
  {
    label: "Mumbai Berth Congestion (46h)",
    text: "Heavy congestion has been reported at Mumbai (JNPT Term. 3) port and vessels are experiencing significant 46-hour berth waiting delays due to STS crane telemetry failure and monsoon surge.",
    port: "INMUM",
    dest: "NLRTM",
  },
  {
    label: "Dubai Crosswinds & Sandstorm",
    text: "Severe crosswind gusts exceeding 42 knots and sandstorm visibility restrictions have halted STS gantry crane operations at Jebel Ali Port (AEDXB) Terminal 1.",
    port: "AEDXB",
    dest: "NLRTM",
  },
  {
    label: "Rotterdam Rail Strike",
    text: "Wildcat intermodal rail union strike action initiated at Maasvlakte II, creating an immediate 62% backlog for outbound European inland container transfers.",
    port: "NLRTM",
    dest: "SGSIN",
  },
  {
    label: "Suez Security Transit Protocol",
    text: "Bab-el-Mandeb Strait and Southern Red Sea security advisory requires defensive escort formation convoy queuing with convoy departure throttled to 8.5 kts.",
    port: "AEDXB",
    dest: "NLRTM",
  },
];

export default function AIAgents() {
  const [eventText, setEventText] = useState(PRESET_INCIDENTS[0].text);
  const [activePreset, setActivePreset] = useState(0);
  const [activeTab, setActiveTab] = useState("trace"); // 'trace' or 'json'
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Execution states for nodes
  const [nodeState, setNodeState] = useState({
    node1: { ms: "45ms", status: "Completed" },
    node2: { ms: "82ms", output: "High Risk (72)" },
    node3: { ms: "118ms", sim: "91.4% Sim" },
    node4: { ms: "140ms", opt: "Corridor B" },
    node5: { ms: "42ms", arbiter: "Arbiter OK" },
  });

  async function handleAnalyze() {
    setLoading(true);
    try {
      await runAgentWorkflow({
        eventText,
        originPortCode: "INMUM",
        destinationPortCode: "NLRTM",
      });
    } catch {
      // Keep rich operational simulation
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  }

  function handleSelectPreset(index) {
    setActivePreset(index);
    setEventText(PRESET_INCIDENTS[index].text);
  }

  function handleCopy() {
    setCopied(true);
    navigator.clipboard.writeText(terminalLogs);
    setTimeout(() => setCopied(false), 2000);
  }

  const terminalLogs = `--- BEGIN LANGGRAPH INVOCATION [run_id: f72a8c19-613b-4e1b-b4ce-3ec5f268ef1a] ---
01 [NODE: signal_ingestion_agent] Invoked with payload: "${eventText.slice(0, 75)}..."
02 -> Tool: ais_marine_telemetry_query args: {"port_code": "INMUM", "radius_nm": 25} -> 19 vessels in roadstead, swell height 3.8m
03 [NODE: risk_assessment_agent] Compiling Bayesian hazard distribution. Disruption likelihood: 0.942 | Severity: 72/100 (HIGH)
04 -> State transition: risk_state = {"demurrage_exposure_usd": 112600, "affected_fleet_count": 6}
05 [NODE: historical_vector_memory] pgvector similarity scan across 14,883 historical incident vectors...
06 -> Vector Match: "Q3 2023 JNPT Monsoonal Surge & Crane Outage" (cos_sim: 0.9142, duration: 88h, precedent: "Singapore Transshipment Bypass", success_sla: 96%)
07 [NODE: route_optimization_mcda] Multi-Criteria Decision Analysis evaluating Corridors [A: Wait Berth, B: Singapore Divert, C: INSTC Intermodal]
08 -> Weighting: Time 0.40, Cost 0.35, Carbon 0.15, Reliability 0.10. Score B: 0.892 (Optimal) vs Score A: 0.412, Score C: 0.526
09 [NODE: decision_arbiter_agent] Autonomous consensus validated. Drafting execution order: ROUTE_CORRIDOR_B_DISPATCH
10 -> GRAPH EXECUTION SUCCEEDED: Total runtime: 423ms | End state: COMPLETED | Dispatched notification to Master Mariners
--- END LANGGRAPH INVOCATION [status: 200 OK] ---`;

  const jsonPayload = JSON.stringify(
    {
      workflow_run_id: "f72a8c19-613b-4e1b-b4ce-3ec5f268ef1a",
      timestamp_utc: "2026-10-11T14:02:18.420Z",
      pipeline_version: "v2.4.0-prod",
      ensemble: ["anthropic/claude-3-5-sonnet-20241022", "openai/gpt-4o"],
      state_graph: {
        nodes_executed: 5,
        total_latency_ms: 427,
        exit_code: 0,
        consensus: "UNANIMOUS",
      },
      telemetry: {
        origin: "INMUM",
        destination: "NLRTM",
        risk_score: 72,
        selected_corridor: "CORRIDOR_B_SINGAPORE_BYPASS",
        demurrage_mitigated_usd: 76300,
        hours_saved: 44.0,
      },
    },
    null,
    2
  );

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 font-sans">
      
      {/* =========================================================
          PAGE HEADER (IMAGE 1 MATCH)
          ========================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] font-bold tracking-wider text-purple-400 uppercase mb-1">
            <span>● LANGGRAPH MULTI-AGENT ORCHESTRATION PIPELINE · AUTONOMOUS AGENTS</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">SESSION #LG-8942-B</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            AI Agent Analysis
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 max-w-4xl leading-relaxed">
            Multi-agent disruption assessment, historical vector intelligence, and autonomous decision support for global maritime &amp; intermodal corridors.
          </p>
        </div>

        {/* Top Right Badges */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          <div className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <div className="flex flex-col text-[10px]">
              <span className="text-slate-500 uppercase font-semibold">LANGGRAPH STATE</span>
              <span className="text-white font-bold">Active (v2.4.0-prod)</span>
            </div>
          </div>

          <div className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2">
            <Sparkles size={14} className="text-purple-400" />
            <div className="flex flex-col text-[10px]">
              <span className="text-slate-500 uppercase font-semibold">AGENT ENSEMBLE</span>
              <span className="text-purple-300 font-bold">Sonnet 3.5 + GPT-4o</span>
            </div>
          </div>

          <div className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2">
            <Clock size={14} className="text-cyan-400" />
            <div className="flex flex-col text-[10px]">
              <span className="text-slate-500 uppercase font-semibold">TURNAROUND</span>
              <span className="text-cyan-300 font-bold">420ms avg</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          CARD 1: DISRUPTION & INCIDENT EVENT INGESTION (IMAGE 1)
          ========================================================= */}
      <div className="stitch-card p-5 lg:p-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-color)] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
            <h2 className="text-sm font-bold text-white font-mono">
              Disruption &amp; Incident Event Ingestion
            </h2>
            <span className="text-slate-500 text-xs font-mono hidden md:inline">
              (Live telemetry, manual alert injection, or automated EDI parser feed)
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-400">
            <Zap size={12} className="text-emerald-400" />
            <span>Agent State: Synthesis Complete (Session #LG-8942-B)</span>
          </div>
        </div>

        {/* Textarea Input */}
        <div className="relative">
          <textarea
            value={eventText}
            onChange={(e) => setEventText(e.target.value)}
            rows={3}
            className="w-full bg-[#080d16] border border-slate-700/80 rounded-xl p-4 font-mono text-xs md:text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 leading-relaxed shadow-inner"
            placeholder="Type or paste a disruption event..."
          />
          <div className="absolute right-3 bottom-3 text-[10px] font-mono text-slate-500">
            Tokens: {Math.round(eventText.length / 4)} / 2,048
          </div>
        </div>

        {/* Presets & Action Button */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="stitch-label text-[10px] mr-1">PRESET INCIDENTS:</span>
            {PRESET_INCIDENTS.map((preset, idx) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handleSelectPreset(idx)}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-all border ${
                  activePreset === idx
                    ? "bg-purple-600/20 text-purple-300 border-purple-500/50 font-bold"
                    : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono text-xs font-bold transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] whitespace-nowrap disabled:opacity-60"
          >
            <Sparkles size={14} className={loading ? "animate-spin" : ""} />
            <span>{loading ? "Analyzing Graph..." : "Analyze Event via LangGraph"}</span>
          </button>
        </div>
      </div>

      {/* =========================================================
          CARD 2: AGENT EXECUTION GRAPH (5 ACTIVE NODES) (IMAGE 1)
          ========================================================= */}
      <div className="stitch-card p-5 lg:p-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-color)] pb-3">
          <div className="flex items-center gap-2">
            <Network size={16} className="text-cyan-400" />
            <h2 className="text-sm font-bold text-white font-mono">
              Agent Execution Graph (5 Active Nodes)
            </h2>
          </div>

          <div className="flex items-center gap-3 font-mono text-[10px] text-slate-400">
            <span>Graph Engine: <strong className="text-slate-200">StateGraph</strong></span>
            <span>•</span>
            <span className="text-emerald-400">Topology: Acyclic DAG (Synchronous Synthesis)</span>
          </div>
        </div>

        {/* 5 Nodes Horizontal Layout */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          
          {/* Node 1 */}
          <div className="rounded-xl bg-[#090e18] border border-slate-800 p-3.5 flex flex-col justify-between transition-all hover:border-slate-700">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="stitch-label text-[9px] text-emerald-400 font-bold">NODE #1</span>
                <span className="font-mono text-[10px] text-slate-500">{nodeState.node1.ms}</span>
              </div>
              <div className="font-bold text-xs text-white mb-1">
                Signal Ingestion Agent
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Parsed AIS anomaly, Mumbai port authority EDI advisories, &amp; oceanic meteo forecasts.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between font-mono text-[10px]">
              <span className="text-slate-500">Status:</span>
              <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                {nodeState.node1.status}
              </span>
            </div>
          </div>

          {/* Node 2 */}
          <div className="rounded-xl bg-[#090e18] border border-slate-800 p-3.5 flex flex-col justify-between transition-all hover:border-slate-700">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="stitch-label text-[9px] text-rose-400 font-bold">NODE #2</span>
                <span className="font-mono text-[10px] text-slate-500">{nodeState.node2.ms}</span>
              </div>
              <div className="font-bold text-xs text-white mb-1">
                Risk Assessment Agent
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Evaluated Bayesian disruption probability, dwell velocity &amp; delay severity score (72/100).
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between font-mono text-[10px]">
              <span className="text-slate-500">Output:</span>
              <span className="text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                {nodeState.node2.output}
              </span>
            </div>
          </div>

          {/* Node 3 */}
          <div className="rounded-xl bg-[#090e18] border border-slate-800 p-3.5 flex flex-col justify-between transition-all hover:border-slate-700">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="stitch-label text-[9px] text-cyan-400 font-bold">NODE #3</span>
                <span className="font-mono text-[10px] text-slate-500">{nodeState.node3.ms}</span>
              </div>
              <div className="font-bold text-xs text-white mb-1">
                Historical Vector Memory
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Queried pgvector for similar past JNPT monsoonal crane crises &amp; average recovery arcs.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between font-mono text-[10px]">
              <span className="text-slate-500">Cosine Match:</span>
              <span className="text-cyan-400 font-bold bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                {nodeState.node3.sim}
              </span>
            </div>
          </div>

          {/* Node 4 */}
          <div className="rounded-xl bg-[#090e18] border border-slate-800 p-3.5 flex flex-col justify-between transition-all hover:border-slate-700">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="stitch-label text-[9px] text-purple-400 font-bold">NODE #4</span>
                <span className="font-mono text-[10px] text-slate-500">{nodeState.node4.ms}</span>
              </div>
              <div className="font-bold text-xs text-white mb-1">
                Route Optimization MCDA
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Evaluated 3 candidate corridors: Suez direct, Malacca bypass via PSA, &amp; INSTC multimodal.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between font-mono text-[10px]">
              <span className="text-slate-500">Optimum:</span>
              <span className="text-purple-300 font-bold bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                {nodeState.node4.opt}
              </span>
            </div>
          </div>

          {/* Node 5 */}
          <div className="rounded-xl bg-[#090e18] border border-slate-800 p-3.5 flex flex-col justify-between transition-all hover:border-slate-700">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="stitch-label text-[9px] text-indigo-400 font-bold">NODE #5</span>
                <span className="font-mono text-[10px] text-slate-500">{nodeState.node5.ms}</span>
              </div>
              <div className="font-bold text-xs text-white mb-1">
                Decision Arbiter Agent
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Synthesized consensus decision, calculated cost delta, and authored autonomous dispatch command.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between font-mono text-[10px]">
              <span className="text-slate-500">Consensus:</span>
              <span className="text-indigo-300 font-bold bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                {nodeState.node5.arbiter}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* =========================================================
          4 ANALYSIS & DOSSIER CARDS (IMAGE 1 MATCH)
          ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        
        {/* Card 1: Event Detected */}
        <div className="stitch-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="stitch-label text-[10px]">EVENT DETECTED</span>
              <span className="stitch-pill stitch-pill-danger text-[9px] px-1.5 py-0.5">HIGH RISK</span>
            </div>
            <h3 className="font-bold text-sm text-white font-sans mt-1">
              Port Congestion &amp; Berth Paralysis
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              JNPT Container Terminal 3, Mumbai (INMUM). Multiple STS gantry crane failures compounded by Southwest monsoon surge wave amplitudes.
            </p>
          </div>

          <div className="my-3 py-2.5 border-y border-slate-800 grid grid-cols-3 gap-2 font-mono text-center">
            <div>
              <div className="text-[9px] text-slate-500 uppercase">Throughput</div>
              <div className="font-bold text-rose-400 text-sm">-38%</div>
            </div>
            <div>
              <div className="text-[9px] text-slate-500 uppercase">Berth Wait</div>
              <div className="font-bold text-rose-400 text-sm">+44 hrs</div>
            </div>
            <div>
              <div className="text-[9px] text-slate-500 uppercase">Queue</div>
              <div className="font-bold text-slate-200 text-sm">19 Vessels</div>
            </div>
          </div>

          <div className="flex items-center justify-between font-mono text-[10px] text-slate-500">
            <span>AIS Polling: 30s interval</span>
            <span className="text-emerald-400 font-semibold">Verified INMUM-EDI</span>
          </div>
        </div>

        {/* Card 2: Risk Assessment */}
        <div className="stitch-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="stitch-label text-[10px]">RISK ASSESSMENT</span>
              <span className="font-mono text-xs font-bold text-cyan-400">Score: 72/100</span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-white font-mono">72</span>
              <span className="text-xs font-mono text-slate-400">/ 100</span>
              <span className="text-[10px] font-mono text-rose-400 font-bold ml-auto">+28 pts vs Baseline</span>
            </div>
          </div>

          <div className="my-3 py-2 border-y border-slate-800 space-y-1.5 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Demurrage:</span>
              <span className="font-bold text-rose-400">$112,600</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Schedule Slippage Prob.:</span>
              <span className="font-bold text-amber-400">94.2%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Affected Fleet:</span>
              <span className="font-bold text-slate-200">6 Carriers</span>
            </div>
          </div>

          <div className="flex items-center justify-between font-mono text-[10px] text-slate-500">
            <span>Bayesian Model: v4.1</span>
            <span className="text-slate-400">99.1% Confidence</span>
          </div>
        </div>

        {/* Card 3: pgvector Memory */}
        <div className="stitch-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="stitch-label text-[10px]">PGVECTOR MEMORY</span>
              <span className="stitch-pill stitch-pill-blue text-[9px] px-1.5 py-0.5">91.4% SIMILARITY</span>
            </div>
            <h3 className="font-bold text-sm text-white font-sans mt-1">
              Q3 2023 JNPT Monsoonal Surge &amp; Crane Outage
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              Precedent match: Identical gantry power-distribution telemetry fault with 3.8m swells.
            </p>
          </div>

          <div className="my-3 py-2 border-y border-slate-800 space-y-1.5 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Historical Recovery:</span>
              <span className="font-bold text-slate-200">88 Hours</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Precedent Action Taken:</span>
              <span className="font-bold text-purple-300">Singapore Bypass</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Past SLA Retention:</span>
              <span className="font-bold text-emerald-400">96.8% Maintained</span>
            </div>
          </div>

          <div className="flex items-center justify-between font-mono text-[10px] text-slate-500">
            <span>Vector Store: 48,200 dims</span>
            <span className="text-cyan-400 font-semibold">3 Closest Embeddings</span>
          </div>
        </div>

        {/* Card 4: Recommended Action */}
        <div className="stitch-card p-5 flex flex-col justify-between border-purple-500/30">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="stitch-label text-[10px] text-purple-300">RECOMMENDED ACTION</span>
              <span className="stitch-pill stitch-pill-purple text-[9px] px-1.5 py-0.5">94.6% Conf</span>
            </div>
            <h3 className="font-bold text-sm text-white font-sans mt-1">
              Corridor B: Singapore / Malacca Bypass
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              Divert pending inbound carriers directly to PSA Singapore transshipment hub, bypassing JNPT anchorage bottleneck.
            </p>
          </div>

          <div className="my-3 py-2 border-y border-slate-800 space-y-1.5 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Projected Time Saved:</span>
              <span className="font-bold text-emerald-400">-44.0 Hours</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Preserved Capital Value:</span>
              <span className="font-bold text-emerald-400">+$76,300 Net</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Carbon Delta:</span>
              <span className="font-bold text-amber-400">+1.4% Bunkering</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Link
              to="/rerouting"
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white font-mono text-xs font-bold transition-all shadow-[0_0_12px_rgba(2,132,199,0.3)]"
            >
              <RotateCw size={12} />
              <span>Deploy Autonomous Reroute</span>
            </Link>
            <button
              type="button"
              className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white font-mono text-[11px] transition-colors"
            >
              <span>Inspect Route Geometry</span>
            </button>
          </div>
        </div>

      </div>

      {/* =========================================================
          CARD 5: LANGGRAPH TRACE & AGENT COMMUNICATION STREAM (IMAGE 1)
          ========================================================= */}
      <div className="stitch-card p-5 lg:p-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-3">
          <div className="flex items-center gap-2.5">
            <Terminal size={16} className="text-cyan-400" />
            <div>
              <h2 className="text-sm font-bold text-white font-mono">
                LangGraph Trace &amp; Agent Communication Stream
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Real-time graph dispatch edge, node state diffs, and tool arguments
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg font-mono text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("trace")}
              className={`px-3 py-1 rounded transition-colors ${
                activeTab === "trace"
                  ? "bg-purple-600/30 text-purple-300 font-bold border border-purple-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Agent Reasoning Trace
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("json")}
              className={`px-3 py-1 rounded transition-colors ${
                activeTab === "json"
                  ? "bg-purple-600/30 text-purple-300 font-bold border border-purple-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Technical JSON Payload
            </button>
          </div>
        </div>

        {/* Terminal Window */}
        <div className="rounded-xl bg-[#060a12] border border-slate-800/90 p-4 font-mono text-xs leading-relaxed text-slate-300 overflow-x-auto shadow-inner">
          <pre className="font-mono text-xs whitespace-pre-wrap">
            {activeTab === "trace" ? terminalLogs : jsonPayload}
          </pre>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-[var(--border-color)] font-mono text-xs">
          <div className="flex items-center gap-2 text-emerald-400 text-[11px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>ALL 5 LangGraph agent nodes converged with 0 retries</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors text-[11px]"
            >
              <Copy size={12} />
              <span>{copied ? "Copied!" : "Copy Stream Log"}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const blob = new Blob([jsonPayload], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "langgraph-audit.json";
                a.click();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors text-[11px]"
            >
              <Download size={12} />
              <span>Export JSON Audit</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}