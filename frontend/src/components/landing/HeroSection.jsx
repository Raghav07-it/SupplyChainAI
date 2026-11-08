import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Ship,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Radio,
  Clock,
  Compass,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Layers,
  Sparkles,
  ChevronRight,
  Anchor,
} from "lucide-react";

export default function HeroSection({ onExploreClick }) {
  const [activePreviewTab, setActivePreviewTab] = useState("corridor"); // 'corridor' | 'agent' | 'comparison'

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background Subtle Gradient & Grid */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-indigo-500/10 via-cyan-500/5 to-transparent blur-3xl opacity-70" />
        <div className="absolute top-32 left-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute top-48 right-10 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Hero Copy */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Live Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--surface-base)] border border-[var(--border-color)] shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[var(--status-success)] animate-pulse" />
            <span className="text-xs font-semibold text-[var(--text-secondary)] tracking-wide">
              AI-Powered Supply Chain Intelligence & Decision Support
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--text-high-contrast)] leading-[1.12]">
            See Beyond Disruptions. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-blue-300">
              Take Control of Your Supply Chain.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-3xl mx-auto leading-relaxed font-normal">
            ChainSight AI unifies multi-tier cargo visibility, live maritime intelligence, and explainable multi-agent decision support — helping logistics teams identify bottlenecks early, evaluate routing trade-offs, and act with operational certainty.
          </p>

          {/* Dual CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              to="/register"
              className="w-full sm:w-auto cs-btn cs-btn-primary text-sm py-3 px-6 shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 group font-semibold"
            >
              <span>Get Started Free</span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <button
              type="button"
              onClick={onExploreClick}
              className="w-full sm:w-auto px-5 py-3 rounded-lg text-sm font-semibold bg-[var(--surface-base)] hover:bg-[var(--surface-overlay)] text-[var(--text-high-contrast)] border border-[var(--border-color)] hover:border-[var(--border-active)] transition-all flex items-center justify-center gap-2"
            >
              <Compass size={15} className="text-[var(--accent-cyan)]" />
              <span>Explore Platform Capabilities</span>
            </button>
          </div>

          {/* Key Trust Signals */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-[var(--text-secondary)] font-medium max-w-3xl mx-auto border-t border-[var(--border-color)]/60">
            <div className="flex items-center justify-center gap-2">
              <Cpu size={15} className="text-[var(--accent-primary-light)] shrink-0" />
              <span>LangGraph Multi-Agent Workflows</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Radio size={15} className="text-[var(--accent-cyan)] shrink-0" />
              <span>Live Port & Corridor Radar</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <ShieldCheck size={15} className="text-[var(--status-success)] shrink-0" />
              <span>Zero Black-Box Rerouting</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Layers size={15} className="text-purple-400 shrink-0" />
              <span>Vector Memory Precedence</span>
            </div>
          </div>
        </div>

        {/* High-Fidelity Interactive Command Center Preview */}
        <div className="mt-12 lg:mt-16 max-w-5xl mx-auto">
          <div className="rounded-2xl border border-[var(--border-active)] bg-[var(--surface-base)] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.85)] overflow-hidden">
            {/* Top Command Deck Header */}
            <div className="bg-[var(--surface-elevated)] border-b border-[var(--border-color)] px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="h-4 w-px bg-[var(--border-color)] mx-1" />
                <span className="font-mono text-[11px] text-[var(--text-dim)] uppercase tracking-wider">
                  CHAINSIGHT COMMAND DECK • LIVE OPERATIONAL MONITOR
                </span>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex items-center bg-[var(--surface-base)] p-1 rounded-lg border border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setActivePreviewTab("corridor")}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                    activePreviewTab === "corridor"
                      ? "bg-[var(--surface-overlay)] text-white shadow-sm"
                      : "text-[var(--text-secondary)] hover:text-white"
                  }`}
                >
                  Corridor Tracker
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab("agent")}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                    activePreviewTab === "agent"
                      ? "bg-[var(--surface-overlay)] text-white shadow-sm"
                      : "text-[var(--text-secondary)] hover:text-white"
                  }`}
                >
                  AI Risk Agent
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab("comparison")}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                    activePreviewTab === "comparison"
                      ? "bg-[var(--surface-overlay)] text-white shadow-sm"
                      : "text-[var(--text-secondary)] hover:text-white"
                  }`}
                >
                  Route Comparison
                </button>
              </div>
            </div>

            {/* Preview Body Content */}
            <div className="p-6 sm:p-8 space-y-6 bg-gradient-to-b from-[var(--surface-base)] to-[#0c121d]">
              {/* Tab 1: Corridor Tracker */}
              {activePreviewTab === "corridor" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary-bg)] border border-[rgba(99,102,241,0.3)] flex items-center justify-center text-[var(--accent-primary-light)]">
                        <Ship size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm sm:text-base text-[var(--text-high-contrast)]">
                            Shipment #CS-8921 • Valencia (ES) &rarr; New York (US)
                          </span>
                          <span className="cs-pill cs-pill-cyan text-[10px] py-0.5">
                            At Sea (On Time)
                          </span>
                        </div>
                        <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                          Carrier: Hapag-Lloyd • 800 Palletized Units • Est. Arrival: Dec 01, 2025
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-[var(--text-dim)]">
                      Speed: 14.8 knots • Calm Sea State
                    </span>
                  </div>

                  {/* Shipment Milestone Progress Bar */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)]">
                      <div className="flex items-center justify-between text-xs font-semibold text-[var(--status-success)]">
                        <span>1. Factory Pickup</span>
                        <CheckCircle2 size={14} />
                      </div>
                      <div className="text-[11px] text-[var(--text-dim)] mt-1">Oct 10 • Valencia Hub</div>
                    </div>

                    <div className="p-3 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)]">
                      <div className="flex items-center justify-between text-xs font-semibold text-[var(--status-success)]">
                        <span>2. Departed Port</span>
                        <CheckCircle2 size={14} />
                      </div>
                      <div className="text-[11px] text-[var(--text-dim)] mt-1">Oct 14 • Berth Cleared</div>
                    </div>

                    <div className="p-3 rounded-lg bg-[var(--surface-elevated)] border border-[var(--accent-primary)] ring-1 ring-[var(--accent-primary)] shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                      <div className="flex items-center justify-between text-xs font-bold text-[var(--accent-primary-light)]">
                        <span>3. Atlantic Transit</span>
                        <span className="animate-pulse">● Active</span>
                      </div>
                      <div className="text-[11px] text-[var(--text-dim)] mt-1">65% Progress • Normal Flow</div>
                    </div>

                    <div className="p-3 rounded-lg bg-[var(--surface-base)] border border-[var(--border-color)] opacity-70">
                      <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)]">
                        <span>4. NY Warehouse</span>
                        <Clock size={14} />
                      </div>
                      <div className="text-[11px] text-[var(--text-dim)] mt-1">Expected Dec 01</div>
                    </div>
                  </div>

                  {/* Corridor Telemetry Snapshot */}
                  <div className="p-4 rounded-xl bg-[var(--surface-card)] border border-[var(--border-color)] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <div className="text-[11px] text-[var(--text-dim)] uppercase font-semibold">Active Port Health</div>
                      <div className="text-sm font-bold text-[var(--status-success)] mt-0.5 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[var(--status-success)]" />
                        NY/NJ Pier 7 &mdash; Clear Flow
                      </div>
                      <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">Average dwell time: 32 minutes</div>
                    </div>

                    <div>
                      <div className="text-[11px] text-[var(--text-dim)] uppercase font-semibold">Weather Advisory</div>
                      <div className="text-sm font-bold text-[var(--text-high-contrast)] mt-0.5">
                        Transatlantic Calm
                      </div>
                      <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">Wave threshold: 1.8m (safe envelope)</div>
                    </div>

                    <div>
                      <div className="text-[11px] text-[var(--text-dim)] uppercase font-semibold">Escrow & Protection</div>
                      <div className="text-sm font-bold text-[var(--accent-cyan)] mt-0.5 flex items-center gap-1">
                        <ShieldCheck size={14} />
                        All-Risk Insured ($3,980)
                      </div>
                      <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">14 Demurrage Free Days Included</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: AI Risk Agent */}
              {activePreviewTab === "agent" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                    <div className="flex items-center gap-2">
                      <Cpu size={18} className="text-[var(--accent-cyan)]" />
                      <span className="text-sm font-bold text-[var(--text-high-contrast)]">
                        LangGraph Agent Assessment: Rotterdam Crane Maintenance Notice
                      </span>
                    </div>
                    <span className="cs-pill cs-pill-amber text-xs">
                      Medium Severity • Advisory
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Agent Step 1 */}
                    <div className="p-4 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)] space-y-2 text-xs">
                      <div className="text-[10px] font-bold text-[var(--accent-primary-light)] uppercase tracking-wider">
                        1. Signal Extraction Agent
                      </div>
                      <div className="font-semibold text-[var(--text-high-contrast)]">
                        Rotterdam Gateway Berth 4
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                        Parsed port authority circular: 48-hour scheduled crane electrical upgrade from Oct 20 to Oct 22.
                      </p>
                    </div>

                    {/* Agent Step 2 */}
                    <div className="p-4 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)] space-y-2 text-xs">
                      <div className="text-[10px] font-bold text-[var(--accent-cyan)] uppercase tracking-wider">
                        2. Vector Memory Match
                      </div>
                      <div className="font-semibold text-[var(--text-high-contrast)]">
                        Historical Precedence #DIS-0418
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                        Chroma vector store retrieved identical 2024 berth maintenance. Empirical dwell queue impact was +36h.
                      </p>
                    </div>

                    {/* Agent Step 3 */}
                    <div className="p-4 rounded-lg bg-[var(--surface-elevated)] border border-[var(--status-success-border)] space-y-2 text-xs">
                      <div className="text-[10px] font-bold text-[var(--status-success)] uppercase tracking-wider">
                        3. Decision Recommendation
                      </div>
                      <div className="font-semibold text-[var(--text-high-contrast)]">
                        Advance Departure by 48h
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                        Recommend switching to Tuesday feeder sailing. Bypasses queue completely and saves an estimated $340 in demurrage.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Route Comparison */}
              {activePreviewTab === "comparison" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                    <span className="text-sm font-bold text-[var(--text-high-contrast)]">
                      Valencia &rarr; New York Ocean Corridor • 3 Verified Alternatives
                    </span>
                    <span className="cs-pill cs-pill-green text-xs">
                      All Quotes Backed by Escrow
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Option 1 */}
                    <div className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)] space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[var(--status-success)] font-semibold">Cheapest Option</span>
                        <span className="text-[10px] uppercase font-bold text-[var(--text-dim)]">Economy</span>
                      </div>
                      <div className="text-2xl font-bold text-[var(--text-high-contrast)]">$3,420</div>
                      <div className="text-xs text-[var(--text-secondary)]">20 Days • Slow Steaming Eco</div>
                      <div className="pt-2 border-t border-[var(--border-color)] text-[11px] text-[var(--text-dim)]">
                        Standard carrier terms • 7 demurrage days
                      </div>
                    </div>

                    {/* Option 2 */}
                    <div className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)] space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[var(--accent-cyan)] font-semibold">Fastest Option</span>
                        <span className="text-[10px] uppercase font-bold text-[var(--text-dim)]">Express</span>
                      </div>
                      <div className="text-2xl font-bold text-[var(--text-high-contrast)]">$4,850</div>
                      <div className="text-xs text-[var(--text-secondary)]">14 Days • Direct Priority Feeder</div>
                      <div className="pt-2 border-t border-[var(--border-color)] text-[11px] text-[var(--text-dim)]">
                        Expedited customs • Priority berth slot
                      </div>
                    </div>

                    {/* Option 3 */}
                    <div className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--accent-primary)] ring-1 ring-[var(--accent-primary)] shadow-md space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[var(--accent-primary-light)] font-semibold">Safest & Recommended</span>
                        <span className="text-[10px] uppercase font-bold text-[var(--accent-primary-light)]">Top Choice</span>
                      </div>
                      <div className="text-2xl font-bold text-[var(--text-high-contrast)]">$3,980</div>
                      <div className="text-xs text-[var(--text-secondary)]">19 Days • Guaranteed Berth</div>
                      <div className="pt-2 border-t border-[var(--border-color)] text-[11px] text-[var(--text-dim)]">
                        Zero delays record • All-risk insurance included
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Proof Tag */}
            <div className="bg-[var(--surface-dim)] px-4 py-2.5 border-t border-[var(--border-color)] flex items-center justify-between text-[11px] text-[var(--text-dim)]">
              <span>* Illustrative interactive preview based on ChainSight AI routing & multi-agent decision models.</span>
              <span className="font-semibold text-[var(--text-secondary)]">ChainSight Enterprise Engine</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
