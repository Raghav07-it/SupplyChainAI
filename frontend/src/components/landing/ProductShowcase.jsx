import { useState } from "react";
import {
  LayoutGrid,
  Ship,
  AlertTriangle,
  Cpu,
  Clock,
  Shield,
  CheckCircle2,
  Anchor,
  Compass,
  ArrowRight,
  Package,
  Layers,
  Sparkles,
} from "lucide-react";

export default function ProductShowcase() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const tabs = [
    {
      id: "dashboard",
      label: "Central Command Deck",
      icon: LayoutGrid,
      title: "Consolidated Operational Visibility Across Every Active Lane",
      description:
        "Eliminate fragmented communication between shipping lines and freight forwarders. ChainSight unifies real-time cargo status, registered inventory, and transit milestones into a single explainable interface.",
      features: [
        "Real-time shipment milestones with automated ETA recalculation",
        "Tenant-isolated product catalog tracking cartons and fragility ratings",
        "Live port status indicators highlighting active berthing queues",
        "Multi-modal freight escrow protection guarantees",
      ],
    },
    {
      id: "routing",
      label: "Multi-Route Optimization",
      icon: Ship,
      title: "Evaluate Ocean Corridors by Cost, Transit Speed, and Operational Risk",
      description:
        "Move past static freight rate sheets. ChainSight's decision engine compares multiple verified carrier routes, breaking down wharfage, fuel adjustments, and demurrage risks so you book with total confidence.",
      features: [
        "Three distinct corridor profiles: Economy, Express, and Guaranteed Berth",
        "Transparent cost breakdown (ocean freight, terminal handling, customs)",
        "Demurrage and detention free days comparison across carriers",
        "All-risk cargo insurance and delay voucher protection options",
      ],
    },
    {
      id: "disruptions",
      label: "Port & Corridor Radar",
      icon: AlertTriangle,
      title: "Continuous Surveillance of Maritime Chokepoints and Weather Fronts",
      description:
        "Stay ahead of unexpected delays before cargo arrives at congested docks. ChainSight monitors labor strikes, crane maintenance, and severe meteorological patterns along your specific shipping lanes.",
      features: [
        "Lane-specific filtering: See only advisories impacting your active cargo",
        "Severity stratification: High Alert, Warning Notice, and Informational updates",
        "Direct operational guidance with plain-English 'What you should do' directives",
        "Automated notifications via verified daily summary digests",
      ],
    },
    {
      id: "agents",
      label: "Multi-Agent AI Engine",
      icon: Cpu,
      title: "Explainable Decision Support Powered by LangGraph and Vector Memory",
      description:
        "Instead of opaque black-box AI predictions, ChainSight deploys specialized agent roles orchestrated in a deterministic workflow to evaluate risks, recall historical precedents, and recommend contingency routes.",
      features: [
        "Multi-agent task decomposition: Signal Extraction &rarr; Vector Retrieval &rarr; Risk Assessment &rarr; Route Recommendation",
        "Semantic similarity search over historical disruption case studies",
        "Itemized impact metrics: Quantified delay hours and cost projections",
        "Strict human-in-the-loop governance: AI proposes, human logistics operators decide",
      ],
    },
  ];

  const currentTab = tabs.find((t) => t.id === activeTab) || tabs[0];

  return (
    <section id="product-overview" className="py-24 bg-[var(--canvas-base)] relative scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-primary-bg)] border border-[rgba(99,102,241,0.3)] text-xs font-semibold text-[var(--accent-primary-light)]">
            <Sparkles size={13} />
            <span>Product Showcase</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-high-contrast)] tracking-tight">
            A Centralized Command Center for Global Supply Chains
          </h2>
          <p className="text-base text-[var(--text-secondary)] leading-relaxed">
            Designed to bridge the gap between complex raw maritime telemetry and actionable operational decisions for modern freight and logistics teams.
          </p>
        </div>

        {/* Tab Navigation Controls */}
        <div className="mt-12 flex justify-center">
          <div className="inline-flex flex-wrap p-1.5 rounded-xl bg-[var(--surface-base)] border border-[var(--border-color)] gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-[var(--accent-primary)] text-white shadow-md shadow-indigo-500/25"
                      : "text-[var(--text-secondary)] hover:text-white hover:bg-[var(--surface-overlay)]"
                  }`}
                >
                  <Icon size={15} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Display Area */}
        <div className="mt-10 rounded-2xl border border-[var(--border-active)] bg-[var(--surface-base)] p-6 lg:p-10 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Narrative & Key Features (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[var(--accent-cyan)] uppercase tracking-wider">
                <currentTab.icon size={16} />
                <span>{currentTab.label}</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-high-contrast)] leading-snug">
                {currentTab.title}
              </h3>

              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {currentTab.description}
              </p>

              <div className="space-y-3 pt-2">
                {currentTab.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-[var(--text-body)]">
                    <CheckCircle2 size={15} className="text-[var(--status-success)] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Visual High-Fidelity UI Mockup (7 cols) */}
            <div className="lg:col-span-7">
              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-card)] p-5 space-y-4 shadow-xl">
                {/* Visual Header */}
                <div className="flex items-center justify-between text-xs pb-3 border-b border-[var(--border-color)]">
                  <span className="font-semibold text-[var(--text-high-contrast)] flex items-center gap-2">
                    <currentTab.icon size={15} className="text-[var(--accent-primary-light)]" />
                    {currentTab.label} Preview
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--surface-base)] text-[var(--text-dim)] border border-[var(--border-color)]">
                    Illustrative UI Preview
                  </span>
                </div>

                {/* Content according to tab */}
                {activeTab === "dashboard" && (
                  <div className="space-y-4 text-xs">
                    {/* Stat Cards */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 rounded-lg bg-[var(--surface-base)] border border-[var(--border-color)]">
                        <div className="text-[10px] text-[var(--text-dim)] uppercase font-semibold">Registered Products</div>
                        <div className="text-xl font-bold text-[var(--text-high-contrast)] mt-1">18 items</div>
                        <div className="text-[10px] text-[var(--status-success)] mt-0.5">● Active catalog</div>
                      </div>
                      <div className="p-3 rounded-lg bg-[var(--surface-base)] border border-[var(--border-color)]">
                        <div className="text-[10px] text-[var(--text-dim)] uppercase font-semibold">Active Shipments</div>
                        <div className="text-xl font-bold text-[var(--text-high-contrast)] mt-1">4 vessels</div>
                        <div className="text-[10px] text-[var(--accent-cyan)] mt-0.5">● On schedule</div>
                      </div>
                      <div className="p-3 rounded-lg bg-[var(--surface-base)] border border-[var(--border-color)]">
                        <div className="text-[10px] text-[var(--text-dim)] uppercase font-semibold">Route Warnings</div>
                        <div className="text-xl font-bold text-[var(--status-warning)] mt-1">1 advisory</div>
                        <div className="text-[10px] text-[var(--status-warning)] mt-0.5">● Port congestion</div>
                      </div>
                    </div>

                    {/* Active Shipment Row */}
                    <div className="p-3.5 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary-bg)] flex items-center justify-center text-[var(--accent-primary-light)]">
                          <Package size={16} />
                        </div>
                        <div>
                          <div className="font-bold text-[var(--text-high-contrast)]">
                            #CS-8921 &bull; Glazed Ceramic Dinnerware
                          </div>
                          <div className="text-[11px] text-[var(--text-dim)]">
                            Valencia (ES) &rarr; New York (US) &bull; Hapag-Lloyd
                          </div>
                        </div>
                      </div>
                      <span className="cs-pill cs-pill-cyan text-[10px]">At Sea</span>
                    </div>

                    <div className="p-3.5 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[var(--surface-base)] flex items-center justify-center text-[var(--text-secondary)]">
                          <Package size={16} />
                        </div>
                        <div>
                          <div className="font-bold text-[var(--text-high-contrast)]">
                            #CS-8902 &bull; Artisan Planters
                          </div>
                          <div className="text-[11px] text-[var(--text-dim)]">
                            Ningbo (CN) &rarr; Rotterdam (NL) &bull; Maersk Line
                          </div>
                        </div>
                      </div>
                      <span className="cs-pill cs-pill-green text-[10px]">Arriving Today</span>
                    </div>
                  </div>
                )}

                {activeTab === "routing" && (
                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)] flex items-center justify-between">
                      <div>
                        <div className="font-bold text-[var(--text-high-contrast)]">Cheapest Option (Economy)</div>
                        <div className="text-[11px] text-[var(--text-secondary)]">20 Days &bull; Slow-steaming direct Atlantic</div>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-bold text-[var(--text-high-contrast)]">$3,420</div>
                        <span className="text-[10px] text-[var(--status-success)]">Save $560</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)] flex items-center justify-between">
                      <div>
                        <div className="font-bold text-[var(--text-high-contrast)]">Fastest Option (Express)</div>
                        <div className="text-[11px] text-[var(--text-secondary)]">14 Days &bull; Priority direct feeder</div>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-bold text-[var(--text-high-contrast)]">$4,850</div>
                        <span className="text-[10px] text-[var(--accent-cyan)]">12 Days Quicker</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-[var(--surface-elevated)] border border-[var(--accent-primary)] ring-1 ring-[var(--accent-primary)] flex items-center justify-between">
                      <div>
                        <div className="font-bold text-[var(--accent-primary-light)]">Safest & Recommended (Top Choice)</div>
                        <div className="text-[11px] text-[var(--text-secondary)]">19 Days &bull; Guaranteed berth schedule + All-risk insurance</div>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-bold text-[var(--text-high-contrast)]">$3,980</div>
                        <span className="text-[10px] text-[var(--status-success)]">Zero Delays</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "disruptions" && (
                  <div className="space-y-3 text-xs">
                    <div className="p-4 rounded-lg bg-[var(--surface-elevated)] border-l-4 border-l-[var(--status-critical)] space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="cs-pill cs-pill-red text-[10px]">● High Alert &mdash; Port Congestion</span>
                        <span className="text-[11px] text-[var(--text-dim)]">Updated 3h ago</span>
                      </div>
                      <div className="font-bold text-sm text-[var(--text-high-contrast)]">
                        Rotterdam Gateway: Crane electrical overhaul causing 48-hour queues
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                        Affects shipment #CS-8902. Free demurrage buffer protects container fees until Oct 28.
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-[var(--surface-elevated)] border-l-4 border-l-[var(--status-warning)] space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="cs-pill cs-pill-amber text-[10px]">● Notice &mdash; Weather Diversion</span>
                        <span className="text-[11px] text-[var(--text-dim)]">Yesterday</span>
                      </div>
                      <div className="font-bold text-sm text-[var(--text-high-contrast)]">
                        Autumn gale warning prompting southerly carrier route shift
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                        Vessels taking calmer southern route around storm front (+14 hours transit, zero sensor triggers).
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === "agents" && (
                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-lg bg-[var(--surface-base)] border border-[var(--border-color)]">
                      <div className="text-[10px] font-bold text-[var(--accent-primary-light)] uppercase tracking-wider mb-1">
                        State Machine Orchestrator: LangGraph
                      </div>
                      <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)] overflow-x-auto py-1">
                        <span className="px-2 py-0.5 rounded bg-[var(--surface-overlay)] text-white">SignalIngestion</span>
                        <span>&rarr;</span>
                        <span className="px-2 py-0.5 rounded bg-[var(--surface-overlay)] text-white">VectorRecall</span>
                        <span>&rarr;</span>
                        <span className="px-2 py-0.5 rounded bg-[var(--surface-overlay)] text-white">RiskMCDA</span>
                        <span>&rarr;</span>
                        <span className="px-2 py-0.5 rounded bg-[var(--accent-primary-bg)] text-[var(--accent-primary-light)] border border-[rgba(99,102,241,0.3)]">HumanSynthesis</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)] space-y-2">
                      <div className="font-semibold text-[var(--text-high-contrast)] flex items-center gap-1.5">
                        <Shield size={14} className="text-[var(--status-success)]" />
                        <span>Explainable Output Rationale</span>
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                        &quot;Historical precedent indicates switching to Rotterdam South Terminal avoids a 36-hour queue at an incremental freight delta of +$120. Expected net savings: $420 in demurrage avoidance.&quot;
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
