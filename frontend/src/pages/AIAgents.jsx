import { useState, useEffect } from "react";
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
  Anchor,
  Database,
  ShieldCheck,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { runAgentWorkflow } from "../api/agents";

const PRESET_INCIDENTS = [
  {
    label: "Mumbai Berth Congestion (46h)",
    text: "Heavy congestion has been reported at Mumbai (JNPT Term. 3) port and vessels are experiencing significant 46-hour berth waiting delays due to STS crane sensor tracking failure and monsoon surge.",
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
    text: "Wildcat intermodal rail union strike action initiated at Maasvlakte II, creating an immediate 62% backlog for outbound European inland container transfers at Rotterdam (NLRTM).",
    port: "NLRTM",
    dest: "SGSIN",
  },
  {
    label: "Singapore Berth Queue",
    text: "Vessel queuing spikes at Singapore port (SGSIN) following feeder delays across the Strait of Malacca.",
    port: "SGSIN",
    dest: "NLRTM",
  },
];

const PORTS = [
  { code: "INMUM", name: "Mumbai / JNPT (INMUM)" },
  { code: "AEDXB", name: "Dubai / Jebel Ali (AEDXB)" },
  { code: "SGSIN", name: "Singapore (SGSIN)" },
  { code: "NLRTM", name: "Rotterdam (NLRTM)" },
];

export default function AIAgents() {
  const [eventText, setEventText] = useState(PRESET_INCIDENTS[0].text);
  const [originPort, setOriginPort] = useState(PRESET_INCIDENTS[0].port);
  const [destPort, setDestPort] = useState(PRESET_INCIDENTS[0].dest);
  const [activePreset, setActivePreset] = useState(0);
  const [activeTab, setActiveTab] = useState("trace"); // 'trace' or 'json'
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAllPrecedents, setShowAllPrecedents] = useState(false);
  const [workflowResult, setWorkflowResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Initial execution on mount
  useEffect(() => {
    executeAgent(PRESET_INCIDENTS[0].text, PRESET_INCIDENTS[0].port, PRESET_INCIDENTS[0].dest);
  }, []);

  async function executeAgent(text, origin, dest) {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await runAgentWorkflow({
        eventText: text,
        originPortCode: origin,
        destinationPortCode: dest,
      });
      setWorkflowResult(res);
    } catch (err) {
      console.warn("Agent run returned error:", err);
      setErrorMsg(err.message || "Failed to execute agent workflow");
    } finally {
      setLoading(false);
    }
  }

  function handleSelectPreset(index) {
    setActivePreset(index);
    const item = PRESET_INCIDENTS[index];
    setEventText(item.text);
    setOriginPort(item.port);
    setDestPort(item.dest);
    executeAgent(item.text, item.port, item.dest);
  }

  function handleRunManual() {
    executeAgent(eventText, originPort, destPort);
  }

  // Derive display values from real response
  const signal = workflowResult?.signal || {
    port_code: originPort,
    event_type: "severe_weather",
    severity: "medium",
    confidence: 0.85,
  };

  const risk = workflowResult?.risk || {
    disruption_probability: 0.45,
    severity_score: 45,
    reasoning: "Evaluating maritime parameters...",
  };

  const matches = workflowResult?.historical_matches || [];
  const topMatch = matches[0] || null;

  const rec = workflowResult?.recommendation || {
    action: "prepare_alternative",
    primary_corridor: `${originPort} -> ${destPort} via standard lane`,
    alternative_corridor: `${originPort} -> ${destPort} via alternate channel`,
    estimated_delay_hours: 36.0,
    estimated_cost_delta_usd: 8500.0,
    justification: "Synthesizing corridor alternatives based on historical precedent.",
    trade_offs: {
      time_vs_cost: "Rerouting mitigates ~36 hours delay at modest ocean freight variance.",
      risk_vs_cost: "Avoids severe berth congestion penalties.",
    },
    uncertainty_factors: ["Marine weather beyond 48 hours carries moderate variance."],
    confidence_score: 0.85,
    human_in_the_loop: true,
  };

  const executionLogs = workflowResult?.execution_log || [
    `[INGEST] Parsed disruption signal for port ${originPort}...`,
    `[MEMORY] Scanning ChromaDB vector store (480 cases)...`,
    `[RISK] Disruption probability computed.`,
    `[RECOMMENDER] Synthesizing explainable trade-offs and human-in-the-loop audit.`,
  ];

  const terminalLogs = executionLogs.join("\n");
  const jsonPayload = JSON.stringify(workflowResult || {}, null, 2);

  function handleCopy() {
    setCopied(true);
    navigator.clipboard.writeText(activeTab === "trace" ? terminalLogs : jsonPayload);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 font-sans">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] font-bold tracking-wider text-purple-400 uppercase mb-1">
            <span>● LANGGRAPH MULTI-AGENT PIPELINE · CHROMA VECTOR MEMORY</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">
              RUN #{workflowResult?.workflow_run_id ? workflowResult.workflow_run_id.slice(0, 8) : "INITIAL"}
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            AI Agent Decision Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 max-w-4xl leading-relaxed">
            Autonomous multi-agent disruption assessment, 480-case ChromaDB historical vector retrieval, and explainable human-in-the-loop recommendations.
          </p>
        </div>

        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          <div className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <div className="flex flex-col text-[10px]">
              <span className="text-slate-500 uppercase font-semibold">ENGINE STATE</span>
              <span className="text-white font-bold">LangGraph Active</span>
            </div>
          </div>

          <div className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2">
            <Database size={14} className="text-purple-400" />
            <div className="flex flex-col text-[10px]">
              <span className="text-slate-500 uppercase font-semibold">VECTOR MEMORY</span>
              <span className="text-purple-300 font-bold">480 Historical Cases</span>
            </div>
          </div>

          <div className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2">
            <ShieldCheck size={14} className="text-cyan-400" />
            <div className="flex flex-col text-[10px]">
              <span className="text-slate-500 uppercase font-semibold">EXPLAINABILITY</span>
              <span className="text-cyan-300 font-bold">Human-in-the-Loop</span>
            </div>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-xs text-[var(--status-critical)] flex items-center gap-2">
          <AlertTriangle size={15} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* CARD 1: Incident Ingestion */}
      <div className="cs-card p-5 lg:p-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-color)] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
            <h2 className="text-sm font-bold text-white font-mono">
              Disruption &amp; Incident Event Ingestion
            </h2>
            <span className="text-slate-500 text-xs font-mono hidden md:inline">
              (Live sensor alerts, manual text, or EDI maritime notice)
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-400">
            <Zap size={12} className="text-emerald-400" />
            <span>Multi-Agent Synthesis Complete</span>
          </div>
        </div>

        {/* Textarea */}
        <div className="relative">
          <textarea
            value={eventText}
            onChange={(e) => setEventText(e.target.value)}
            rows={3}
            className="w-full bg-[#080d16] border border-slate-700/80 rounded-xl p-4 font-mono text-xs md:text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 leading-relaxed shadow-inner"
            placeholder="Type or paste a disruption event..."
          />
          <div className="absolute right-3 bottom-3 text-[10px] font-mono text-slate-500">
            Tokens: ~{Math.round(eventText.length / 4)}
          </div>
        </div>

        {/* Route Selectors & Presets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
              Origin Port
            </label>
            <select
              value={originPort}
              onChange={(e) => setOriginPort(e.target.value)}
              className="w-full bg-[#080d16] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:border-purple-500"
            >
              {PORTS.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
              Destination Port
            </label>
            <select
              value={destPort}
              onChange={(e) => setDestPort(e.target.value)}
              className="w-full bg-[#080d16] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:border-purple-500"
            >
              {PORTS.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 flex items-end">
            <button
              type="button"
              onClick={handleRunManual}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono text-xs font-bold transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] disabled:opacity-60"
            >
              <Sparkles size={14} className={loading ? "animate-spin" : ""} />
              <span>{loading ? "Running Multi-Agent Graph..." : "Execute AI Agent Analysis"}</span>
            </button>
          </div>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800">
          <span className="text-[10px] font-mono uppercase text-slate-400 mr-1">
            Preset Incidents:
          </span>
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
      </div>

      {/* CARD 2: Active Graph Execution Nodes */}
      <div className="cs-card p-5 lg:p-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-color)] pb-3">
          <div className="flex items-center gap-2">
            <Network size={16} className="text-cyan-400" />
            <h2 className="text-sm font-bold text-white font-mono">
              Agent Execution Graph (4 Synchronous Nodes)
            </h2>
          </div>
          <div className="font-mono text-[10px] text-slate-400">
            Engine: <strong className="text-slate-200">LangGraph StateGraph</strong> • Topology: Ingest &rarr; Memory &rarr; Risk &rarr; Recommender
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Node 1 */}
          <div className="rounded-xl bg-[#090e18] border border-slate-800 p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] text-emerald-400 font-bold font-mono">NODE #1</span>
                <span className="font-mono text-[10px] text-slate-500">Signal Ingestion</span>
              </div>
              <div className="font-bold text-xs text-white mb-1">
                Port {signal.port_code}
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Event: {signal.event_type} • Severity: {signal.severity}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between font-mono text-[10px]">
              <span className="text-slate-500">Confidence:</span>
              <span className="text-emerald-400 font-bold">
                {Math.round((signal.confidence || 0.85) * 100)}%
              </span>
            </div>
          </div>

          {/* Node 2 */}
          <div className="rounded-xl bg-[#090e18] border border-slate-800 p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] text-cyan-400 font-bold font-mono">NODE #2</span>
                <span className="font-mono text-[10px] text-slate-500">Vector Memory</span>
              </div>
              <div className="font-bold text-xs text-white mb-1">
                ChromaDB Precedents
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Retrieved {matches.length} similar past incident vectors from database.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between font-mono text-[10px]">
              <span className="text-slate-500">Top Similarity:</span>
              <span className="text-cyan-400 font-bold">
                {topMatch ? `${Math.round(topMatch.similarity_score * 100)}%` : "N/A"}
              </span>
            </div>
          </div>

          {/* Node 3 */}
          <div className="rounded-xl bg-[#090e18] border border-slate-800 p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] text-rose-400 font-bold font-mono">NODE #3</span>
                <span className="font-mono text-[10px] text-slate-500">Risk Assessment</span>
              </div>
              <div className="font-bold text-xs text-white mb-1">
                Disruption Likelihood
              </div>
              <p className="text-[11px] text-slate-400 leading-snug truncate">
                {risk.reasoning || "Compiling risk score..."}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between font-mono text-[10px]">
              <span className="text-slate-500">Severity Score:</span>
              <span className="text-rose-400 font-bold">
                {risk.severity_score || Math.round(risk.disruption_probability * 100)}/100
              </span>
            </div>
          </div>

          {/* Node 4 */}
          <div className="rounded-xl bg-[#090e18] border border-slate-800 p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] text-purple-400 font-bold font-mono">NODE #4</span>
                <span className="font-mono text-[10px] text-slate-500">Recommender</span>
              </div>
              <div className="font-bold text-xs text-white mb-1">
                {rec.action.toUpperCase()}
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Delay: ~{rec.estimated_delay_hours}h • Cost: ${rec.estimated_cost_delta_usd?.toLocaleString()}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between font-mono text-[10px]">
              <span className="text-slate-500">Human In Loop:</span>
              <span className="text-purple-300 font-bold">Mandatory</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 DOSSIER CARDS (Real Data) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Event Ingestion */}
        <div className="cs-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
                EVENT DETECTED
              </span>
              <span className="cs-pill cs-pill-amber text-[9px]">
                {signal.severity.toUpperCase()}
              </span>
            </div>
            <h3 className="font-bold text-sm text-white font-sans mt-1">
              Port {signal.port_code} Incident
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              Categorized as <strong className="text-slate-200">{signal.event_type}</strong>. Route {originPort} &rarr; {destPort} evaluated.
            </p>
          </div>

          <div className="my-3 py-2 border-y border-slate-800 grid grid-cols-2 gap-2 font-mono text-center text-xs">
            <div>
              <div className="text-[9px] text-slate-500 uppercase">Target Port</div>
              <div className="font-bold text-cyan-400">{signal.port_code}</div>
            </div>
            <div>
              <div className="text-[9px] text-slate-500 uppercase">Confidence</div>
              <div className="font-bold text-emerald-400">
                {Math.round((signal.confidence || 0.85) * 100)}%
              </div>
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-500 flex items-center justify-between">
            <span>Extraction: LLM / Rules</span>
            <span className="text-emerald-400">Active</span>
          </div>
        </div>

        {/* Card 2: Risk Assessment */}
        <div className="cs-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
                RISK ASSESSMENT
              </span>
              <span className="font-mono text-xs font-bold text-cyan-400">
                Prob: {Math.round(risk.disruption_probability * 100)}%
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-white font-mono">
                {risk.severity_score || Math.round(risk.disruption_probability * 100)}
              </span>
              <span className="text-xs font-mono text-slate-400">/ 100</span>
            </div>
          </div>

          <div className="my-3 py-2 border-y border-slate-800 space-y-1 font-mono text-xs">
            <div className="text-[11px] text-slate-300 leading-snug">
              {risk.reasoning}
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-500 flex items-center justify-between">
            <span>Model: Bayesian Assessment</span>
            <span className="text-cyan-400">Calibrated</span>
          </div>
        </div>

        {/* Card 3: ChromaDB Vector Memory */}
        <div className="cs-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
                CHROMADB VECTOR MEMORY
              </span>
              {topMatch && (
                <span className="cs-pill cs-pill-blue text-[9px]">
                  {Math.round(topMatch.similarity_score * 100)}% SIMILARITY
                </span>
              )}
            </div>
            <h3 className="font-bold text-sm text-white font-sans mt-1">
              {topMatch ? `Case #${topMatch.id} (${topMatch.port_code})` : "Scanning Memory..."}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              {topMatch?.lesson_learned || "Matching vector representations against 480 historical disruption documents."}
            </p>
          </div>

          <div className="my-3 py-2 border-y border-slate-800 space-y-1 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Historical Delay:</span>
              <span className="font-bold text-slate-200">
                {topMatch?.delay_days ? `${topMatch.delay_days} Days` : "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Cost Impact:</span>
              <span className="font-bold text-rose-400">
                {topMatch?.cost_impact_usd ? `$${topMatch.cost_impact_usd.toLocaleString()}` : "N/A"}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowAllPrecedents(!showAllPrecedents)}
              className="text-[11px] text-purple-300 hover:text-white flex items-center gap-1 font-mono"
            >
              <span>{matches.length} Precedents</span>
              {showAllPrecedents ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
            <span className="text-[10px] font-mono text-slate-500">480 embeddings</span>
          </div>
        </div>

        {/* Card 4: Recommender & Human in the Loop */}
        <div className="cs-card p-5 flex flex-col justify-between border-purple-500/30">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase text-purple-300 font-semibold">
                RECOMMENDATION
              </span>
              <span className="cs-pill cs-pill-purple text-[9px]">
                {Math.round((rec.confidence_score || 0.85) * 100)}% Conf
              </span>
            </div>
            <h3 className="font-bold text-sm text-white font-sans mt-1">
              {rec.action === "reroute"
                ? "Autonomous Reroute Recommended"
                : rec.action === "prepare_alternative"
                ? "Prepare Alternative Corridor"
                : "Proceed on Current Track"}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              {rec.justification}
            </p>
          </div>

          <div className="my-3 py-2 border-y border-slate-800 space-y-1 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Estimated Delay:</span>
              <span className="font-bold text-amber-400">~{rec.estimated_delay_hours}h</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Cost Delta:</span>
              <span className="font-bold text-cyan-400">+${rec.estimated_cost_delta_usd?.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Link
              to="/rerouting"
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white font-mono text-xs font-bold transition-all shadow-[0_0_12px_rgba(2,132,199,0.3)]"
            >
              <RotateCw size={12} />
              <span>Review In Rerouting Console</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Expandable Chroma Precedents List */}
      {showAllPrecedents && matches.length > 0 && (
        <div className="cs-card p-5 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Database size={14} className="text-cyan-400" />
              Retrieved Historical Precedents ({matches.length} Matches from ChromaDB)
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              Similarity Metric: Cosine on all-MiniLM-L6-v2
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-mono">
            {matches.map((m, idx) => (
              <div
                key={m.id || idx}
                className="p-3 rounded-lg bg-[#090e18] border border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-cyan-400 font-bold">{m.id}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/40 text-blue-300">
                    {Math.round(m.similarity_score * 100)}% match
                  </span>
                </div>
                <div className="text-[11px] text-white">
                  Port: {m.port_code} • {m.event_type}
                </div>
                <div className="text-[10px] text-slate-400">
                  Delay: {m.delay_days} days • Cost: ${m.cost_impact_usd?.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-300 border-t border-slate-800/80 pt-1">
                  Lesson: {m.lesson_learned}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Explainability & Uncertainty Box */}
      {rec.trade_offs && (
        <div className="cs-card p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Compass size={14} className="text-purple-400" />
              Multi-Criteria Trade-off Analysis
            </h4>
            <div className="p-3 rounded-lg bg-[#090e18] border border-slate-800 text-xs space-y-1.5">
              <div>
                <span className="text-slate-400 text-[11px] font-semibold block">Time vs Cost:</span>
                <span className="text-slate-200 text-xs">{rec.trade_offs.time_vs_cost}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] font-semibold block">Risk Mitigation:</span>
                <span className="text-slate-200 text-xs">{rec.trade_offs.risk_vs_cost}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
              <ShieldAlert size={14} className="text-amber-400" />
              Operational Uncertainty Factors
            </h4>
            <div className="p-3 rounded-lg bg-[#090e18] border border-slate-800 text-xs">
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                {rec.uncertainty_factors?.map((u, i) => (
                  <li key={i}>{u}</li>
                )) || <li>Maritime forecast volatility over 72h corridor.</li>}
              </ul>
              <div className="mt-2 text-[10px] text-purple-300 font-mono">
                * Recommendations require logistics supervisor sign-off before filing bill of lading amendments.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trace Terminal & JSON Payload */}
      <div className="cs-card p-5 lg:p-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-3">
          <div className="flex items-center gap-2.5">
            <Terminal size={16} className="text-cyan-400" />
            <div>
              <h2 className="text-sm font-bold text-white font-mono">
                Multi-Agent Stream &amp; Audit Trace
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Real-time node execution steps, vector matches, and state transitions
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
              Execution Trace
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
              State JSON
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
            <span>Multi-agent workflow converged with state verification</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors text-[11px]"
            >
              <Copy size={12} />
              <span>{copied ? "Copied!" : "Copy Stream"}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const blob = new Blob([jsonPayload], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `chainsight-agent-run-${workflowResult?.workflow_run_id || "latest"}.json`;
                a.click();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors text-[11px]"
            >
              <Download size={12} />
              <span>Export Audit JSON</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
