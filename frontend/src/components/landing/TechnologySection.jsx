import {
  Cpu,
  Database,
  SlidersHorizontal,
  ShieldCheck,
  Server,
  Network,
  Radio,
  FileCode,
  Lock,
} from "lucide-react";

export default function TechnologySection() {
  const techPillars = [
    {
      icon: Cpu,
      title: "LangGraph Multi-Agent Orchestration",
      tag: "Agentic AI Core",
      color: "indigo",
      description:
        "ChainSight avoids fragile single-prompt generation by decomposing complex logistics challenges into deterministic agent nodes: Signal Extraction, Vector Memory Recall, Risk Quantification, and Route Proposal.",
      specs: [
        "Stateful TypedDict graph state with error-handling checkpoints",
        "Dedicated agent personas with bounded responsibility scopes",
        "Deterministic workflow status transitions without hallucinated jumps",
      ],
    },
    {
      icon: Database,
      title: "Chroma Semantic Vector Memory",
      tag: "Historical Retrieval",
      color: "cyan",
      description:
        "Embedding-powered vector storage indexes historical port closures, labor disputes, and extreme maritime weather incidents to ground current recommendations in empirical precedent.",
      specs: [
        "Cosine similarity search over curated disruption incident archives",
        "Extracts proven resolution timelines and empirical demurrage impact",
        "Informs current risk predictions with actual historical recovery curves",
      ],
    },
    {
      icon: SlidersHorizontal,
      title: "Multi-Criteria Decision Analysis (MCDA)",
      tag: "Algorithmic Routing",
      color: "blue",
      description:
        "The routing engine computes balanced alternatives across non-linear trade-offs, factoring in vessel transit days, demurrage free periods, fuel adjustment factors (BAF), and cargo fragility ratings.",
      specs: [
        "Pareto-optimal ranking across Economy, Express, and Guaranteed routes",
        "Demurrage and detention liability buffers factored into total landed quote",
        "Fragility-aware routing recommendations for high-risk ceramic/sensitive cargo",
      ],
    },
    {
      icon: Server,
      title: "FastAPI Backend & Tenant Data Sovereignty",
      tag: "Enterprise Architecture",
      color: "green",
      description:
        "High-performance async Python backend with PostgreSQL and SQLAlchemy, enforcing strict query-level tenant isolation so competing suppliers cannot access or enumerate each other's cargo records.",
      specs: [
        "Cryptographically signed JWT bearer authentication with bcrypt password hashing",
        "Strict supplier-scoped database queries preventing Insecure Direct Object References (IDOR)",
        "Automated dynamic schema migrations for table resiliency",
      ],
    },
  ];

  return (
    <section id="technology" className="py-24 bg-[var(--canvas-base)] relative scroll-mt-20 border-t border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-semibold text-purple-400">
            <Network size={13} />
            <span>Under The Hood</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-high-contrast)] tracking-tight">
            Enterprise Architecture Built for Reliability and Auditability
          </h2>
          <p className="text-base text-[var(--text-secondary)] leading-relaxed">
            Combining multi-agent intelligence, vector embeddings, and mathematical routing models with strict human-in-the-loop governance.
          </p>
        </div>

        {/* 4 Architectural Pillars Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-8">
          {techPillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-base)] p-7 sm:p-8 space-y-5 hover:border-[var(--border-active)] transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)] flex items-center justify-center text-[var(--accent-primary-light)] shadow-sm">
                      <Icon size={20} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--surface-overlay)] text-[var(--text-secondary)] border border-[var(--border-color)]">
                      {p.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-[var(--text-high-contrast)]">
                    {p.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    {p.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[var(--border-color)] space-y-2">
                  <div className="text-[10px] uppercase font-bold text-[var(--text-dim)] tracking-wider">
                    Technical Specifications
                  </div>
                  {p.specs.map((spec, sIdx) => (
                    <div key={sIdx} className="text-xs text-[var(--text-body)] flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-cyan)] shrink-0 mt-1.5" />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Human-in-the-Loop Philosophy Banner */}
        <div className="mt-12 rounded-2xl bg-gradient-to-r from-[var(--surface-elevated)] via-[#162030] to-[var(--surface-elevated)] border border-[var(--border-active)] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--status-success-bg)] border border-[var(--status-success-border)] flex items-center justify-center text-[var(--status-success)] shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="text-base font-bold text-[var(--text-high-contrast)]">
                Our Core Stance: Decision Support, Not Black-Box Autonomy
              </h4>
              <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-2xl leading-relaxed">
                ChainSight AI models risks, extracts insights, and computes route permutations — but high-stakes commercial commitments, bill-of-lading terms, and booking confirmations require explicit human operator approval.
              </p>
            </div>
          </div>
          <span className="cs-pill cs-pill-green text-xs font-semibold shrink-0 py-1.5 px-3">
            Human-in-the-Loop Verified
          </span>
        </div>
      </div>
    </section>
  );
}
