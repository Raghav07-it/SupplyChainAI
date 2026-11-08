import {
  Eye,
  AlertTriangle,
  Radio,
  Cpu,
  Compass,
  RefreshCw,
  Database,
  ArrowRight,
  Shield,
  Clock,
  Layers,
  Sparkles,
  Ship,
  TrendingUp,
} from "lucide-react";

export default function CapabilitiesSection() {
  return (
    <section id="capabilities" className="py-24 bg-[var(--canvas-base)] relative scroll-mt-20 border-t border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-cyan-bg)] border border-[rgba(6,182,212,0.3)] text-xs font-semibold text-[var(--accent-cyan)]">
            <Layers size={13} />
            <span>Platform Capabilities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-high-contrast)] tracking-tight">
            Engineered for Precision Across Every Supply Chain Touchpoint
          </h2>
          <p className="text-base text-[var(--text-secondary)] leading-relaxed">
            Seven specialized operational capabilities designed to detect friction early, quantify disruption risk, and equip logistics managers with actionable route alternatives.
          </p>
        </div>

        {/* Dynamic Asymmetrical Layout */}
        <div className="mt-14 space-y-6">
          {/* Top Row: Two Large Spotlight Capabilities (7 cols / 5 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Capability 1: Supply Chain Visibility */}
            <div className="lg:col-span-7 rounded-2xl bg-gradient-to-br from-[var(--surface-base)] to-[#131c2b] border border-[var(--border-active)] p-8 space-y-6 relative overflow-hidden group hover:border-[var(--accent-primary)] transition-all">
              <div className="w-12 h-12 rounded-xl bg-[var(--accent-primary-bg)] border border-[rgba(99,102,241,0.3)] flex items-center justify-center text-[var(--accent-primary-light)]">
                <Eye size={22} />
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-[var(--accent-primary-light)] uppercase tracking-wider">
                  01 &bull; Unified Operations
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-high-contrast)]">
                  Supply Chain Visibility
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Consolidated tracking of live shipments, pallet quantities, container weights, and export warehouse readiness. Connects SKU cargo profiles with actual carrier ocean legs without relying on scattered emails or manual spreadsheets.
                </p>
              </div>

              {/* In-Card Miniature Visual */}
              <div className="pt-2 border-t border-[var(--border-color)]">
                <div className="p-3.5 rounded-lg bg-[var(--surface-card)] border border-[var(--border-color)] flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Ship size={14} className="text-[var(--accent-cyan)]" />
                    <span className="font-semibold text-[var(--text-high-contrast)]">FCL 20ft Standard Manifests</span>
                  </div>
                  <span className="text-[11px] font-mono text-[var(--text-dim)]">
                    Real-time carrier milestone telemetry
                  </span>
                </div>
              </div>
            </div>

            {/* Capability 2: AI-Powered Analysis */}
            <div className="lg:col-span-5 rounded-2xl bg-gradient-to-br from-[var(--surface-base)] to-[#151926] border border-[var(--border-active)] p-8 space-y-6 relative overflow-hidden group hover:border-purple-500 transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Cpu size={22} />
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                  02 &bull; Multi-Agent Intelligence
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-high-contrast)]">
                  AI-Powered Analysis
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Coordinated LangGraph agent teams ingest raw maritime circulars, estimate delay risk in quantitative hours, and evaluate financial exposure across detention and demurrage liabilities.
                </p>
              </div>

              <div className="pt-2 border-t border-[var(--border-color)]">
                <div className="p-3 rounded-lg bg-[var(--surface-card)] border border-[var(--border-color)] text-xs flex items-center justify-between text-purple-300">
                  <span className="font-mono text-[11px]">Task Decomposition Pipeline</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                    Deterministic
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Row: Three Mid-Sized Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Capability 3: Disruption Intelligence */}
            <div className="rounded-2xl bg-[var(--surface-base)] border border-[var(--border-color)] p-6 space-y-4 hover:border-[var(--status-critical)] transition-all">
              <div className="w-10 h-10 rounded-lg bg-[var(--status-critical-bg)] border border-[var(--status-critical-border)] flex items-center justify-center text-[var(--status-critical)]">
                <AlertTriangle size={18} />
              </div>
              <div>
                <div className="text-[10px] font-bold text-[var(--status-critical)] uppercase tracking-wider">
                  03 &bull; Early Warning
                </div>
                <h4 className="text-base font-bold text-[var(--text-high-contrast)] mt-1">
                  Disruption Intelligence
                </h4>
                <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                  Monitors port labor lockouts, crane maintenance shutdowns, and berthing queues, providing prompt severity classifications and actionable mitigation notices.
                </p>
              </div>
            </div>

            {/* Capability 4: Live Intelligence */}
            <div className="rounded-2xl bg-[var(--surface-base)] border border-[var(--border-color)] p-6 space-y-4 hover:border-[var(--accent-cyan)] transition-all">
              <div className="w-10 h-10 rounded-lg bg-[var(--accent-cyan-bg)] border border-[rgba(6,182,212,0.3)] flex items-center justify-center text-[var(--accent-cyan)]">
                <Radio size={18} />
              </div>
              <div>
                <div className="text-[10px] font-bold text-[var(--accent-cyan)] uppercase tracking-wider">
                  04 &bull; Environmental Signals
                </div>
                <h4 className="text-base font-bold text-[var(--text-high-contrast)] mt-1">
                  Live Intelligence
                </h4>
                <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                  Aggregates verified trade advisories, meteorological wave forecasts, and gale warnings along critical maritime straits to understand broader transit conditions.
                </p>
              </div>
            </div>

            {/* Capability 5: Route Optimization */}
            <div className="rounded-2xl bg-[var(--surface-base)] border border-[var(--border-color)] p-6 space-y-4 hover:border-[var(--accent-primary)] transition-all">
              <div className="w-10 h-10 rounded-lg bg-[var(--accent-primary-bg)] border border-[rgba(99,102,241,0.3)] flex items-center justify-center text-[var(--accent-primary-light)]">
                <Compass size={18} />
              </div>
              <div>
                <div className="text-[10px] font-bold text-[var(--accent-primary-light)] uppercase tracking-wider">
                  05 &bull; Corridor Analysis
                </div>
                <h4 className="text-base font-bold text-[var(--text-high-contrast)] mt-1">
                  Intelligent Route Optimization
                </h4>
                <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                  Multi-criteria scoring calculates the optimal corridor based on fuel surcharges, voyage days, carrier on-time records, and total landed freight cost.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Row: Two Wide Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Capability 6: Autonomous Rerouting */}
            <div className="rounded-2xl bg-[var(--surface-base)] border border-[var(--border-color)] p-7 space-y-4 hover:border-[var(--status-success)] transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--status-success-bg)] border border-[var(--status-success-border)] flex items-center justify-center text-[var(--status-success)]">
                  <RefreshCw size={18} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-[var(--status-success)] uppercase tracking-wider">
                    06 &bull; Contingency Execution
                  </div>
                  <h4 className="text-base font-bold text-[var(--text-high-contrast)]">
                    Autonomous Rerouting
                  </h4>
                </div>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                When active voyages face severe port congestion or weather diversion, the engine dynamically proposes alternative feeder loops, discharge ports, and customs-clearance lanes.
              </p>
            </div>

            {/* Capability 7: Historical Memory */}
            <div className="rounded-2xl bg-[var(--surface-base)] border border-[var(--border-color)] p-7 space-y-4 hover:border-indigo-400 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Database size={18} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                    07 &bull; Semantic Precedence
                  </div>
                  <h4 className="text-base font-bold text-[var(--text-high-contrast)]">
                    Historical Disruption Memory
                  </h4>
                </div>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Powered by a Chroma vector store, ChainSight retrieves past disruption incidents, resolution times, and empirical demurrage costs to ground current recommendations in verified historical evidence.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

