import {
  Sparkles,
  Shield,
  FileCheck,
  CheckCircle2,
  Clock,
  Compass,
  Lock,
  MessageSquare,
} from "lucide-react";

export default function DifferentiatorsSection() {
  const differentiators = [
    {
      icon: MessageSquare,
      title: "Explainable Context, Never Just a Black-Box Score",
      description:
        "Logistics managers need to justify decisions to stakeholders. ChainSight provides the underlying rationale: exactly why a carrier route was chosen, itemized fee breakdowns, and empirical delay risks.",
    },
    {
      icon: Clock,
      title: "Transparent Information Freshness & Uncertainty",
      description:
        "Every port advisory, AIS position, and weather forecast explicitly displays its source freshness timestamp and uncertainty boundaries, so your team never acts on stale assumptions.",
    },
    {
      icon: Lock,
      title: "Backend Multi-Tenant Data Sovereignty",
      description:
        "Data isolation is enforced at the database query level on the backend. Your proprietary SKUs, shipment margins, supplier contracts, and active cargo lanes are strictly invisible to other organizations.",
    },
    {
      icon: Compass,
      title: "Zero Maritime Jargon &mdash; Plain Operational English",
      description:
        "We translate dense maritime acronyms and academic mathematical formulas into actionable directives: when to pack crates, when to advance sailings, and how many demurrage days you have left.",
    },
  ];

  return (
    <section id="differentiators" className="py-24 bg-[var(--canvas-base)] relative scroll-mt-20 border-t border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-primary-bg)] border border-[rgba(99,102,241,0.3)] text-xs font-semibold text-[var(--accent-primary-light)]">
            <Sparkles size={13} />
            <span>Why ChainSight AI</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-high-contrast)] tracking-tight">
            Designed for Practical, Real-World Operational Confidence
          </h2>
          <p className="text-base text-[var(--text-secondary)] leading-relaxed">
            Four guiding design principles that make ChainSight AI a reliable partner for logistics teams rather than another noisy notification dashboard.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-8">
          {differentiators.map((d, idx) => {
            const Icon = d.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-base)] p-7 space-y-4 hover:border-[var(--accent-primary)] transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary-bg)] border border-[rgba(99,102,241,0.3)] flex items-center justify-center text-[var(--accent-primary-light)]">
                  <Icon size={18} />
                </div>
                <h3 className="text-lg font-bold text-[var(--text-high-contrast)]">
                  {d.title}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {d.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

