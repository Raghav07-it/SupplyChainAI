import { useState } from "react";
import {
  Radio,
  Search,
  Cpu,
  SlidersHorizontal,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Ship,
  Clock,
  DollarSign,
  AlertTriangle,
} from "lucide-react";

export default function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(2); // Default to Step 3 (Analyze) for impactful view

  const steps = [
    {
      step: 1,
      name: "Monitor",
      icon: Radio,
      badge: "Step 01 &bull; Ingestion",
      title: "Continuous Ingestion of Supply Chain Signals",
      summary:
        "ChainSight continuously gathers telemetry across registered cargo manifests, ocean vessel positions, active port berthing queues, and international maritime notices.",
      actionText: "Monitored inputs include AIS updates, terminal dwell logs, and meteorological gales.",
      preview: {
        type: "Telemetry Ingestion",
        details: [
          { label: "Active Corridors", value: "Transatlantic, North Sea, Suez Transit" },
          { label: "Port Feeds", value: "Valencia, Rotterdam, New York Pier 7" },
          { label: "Ingestion Frequency", value: "Real-time webhook & periodic poll" },
        ],
      },
    },
    {
      step: 2,
      name: "Detect",
      icon: Search,
      badge: "Step 02 &bull; Recognition",
      title: "Early Friction Detection & Anomaly Spotting",
      summary:
        "Pattern recognition algorithms identify potential bottlenecks, port labor disputes, and severe weather fronts before your cargo departs factory gates or transshipment docks.",
      actionText: "Flags queues exceeding standard tolerance thresholds (e.g. dwell time > 24 hours).",
      preview: {
        type: "Incident Trigger",
        details: [
          { label: "Detected Anomaly", value: "Rotterdam Gateway Crane Electrical Lockout" },
          { label: "Queue Projection", value: "+36 to +48 hours vessel delay" },
          { label: "Affected Cargo", value: "Shipment #CS-8902 (Ceramic Planters)" },
        ],
      },
    },
    {
      step: 3,
      name: "Analyze",
      icon: Cpu,
      badge: "Step 03 &bull; Multi-Agent Intelligence",
      title: "Multi-Agent & Vector Precedence Assessment",
      summary:
        "Specialized LangGraph AI agents work collaboratively. The Risk Analyst models delay hours, while the Chroma vector engine matches historical disruption incidents to calculate expected costs.",
      actionText: "Replaces vague warnings with quantified monetary exposure and verified empirical data.",
      preview: {
        type: "Agent Synthesis Output",
        details: [
          { label: "Agent Pipeline", value: "Signal &rarr; VectorRecall &rarr; RiskMCDA" },
          { label: "Historical Match", value: "2024 Berth Upgrade (#DIS-0418, 92% similarity)" },
          { label: "Demurrage Risk", value: "$420 expected terminal demurrage penalty" },
        ],
      },
    },
    {
      step: 4,
      name: "Optimize",
      icon: SlidersHorizontal,
      badge: "Step 04 &bull; Evaluation",
      title: "Algorithmic Route Trade-Off Comparison",
      summary:
        "The optimization engine evaluates multi-criteria route permutations, balancing slow-steaming ocean economy rates against expedited direct sailings and guaranteed berth schedules.",
      actionText: "Considers all-risk cargo insurance, wharfage, and demurrage grace windows.",
      preview: {
        type: "Alternative Corridor Ranking",
        details: [
          { label: "Option A (Economy)", value: "$3,420 &bull; 20 Days (Standard wharfage)" },
          { label: "Option B (Express)", value: "$4,850 &bull; 14 Days (Priority feeder)" },
          { label: "Option C (Recommended)", value: "$3,980 &bull; 19 Days (Guaranteed Berth + Insured)" },
        ],
      },
    },
    {
      step: 5,
      name: "Decide",
      icon: CheckCircle2,
      badge: "Step 05 &bull; Human Oversight",
      title: "Transparent Recommendations & Actionable Decisions",
      summary:
        "ChainSight presents an audit-ready, plain-English mitigation proposal directly to the logistics manager. The final choice always remains in human hands.",
      actionText: "No autonomous actions without explicit user review and quote locking.",
      preview: {
        type: "Decision Confirmation",
        details: [
          { label: "Action Taken", value: "Advance departure by 48h to Tuesday feeder" },
          { label: "Operational Outcome", value: "Completely bypasses Rotterdam queue" },
          { label: "Net Savings", value: "~$340 in port demurrage avoidance" },
        ],
      },
    },
  ];

  const currentStep = steps[activeStep];

  return (
    <section id="how-it-works" className="py-24 bg-[var(--canvas-base)] relative scroll-mt-20 border-t border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-primary-bg)] border border-[rgba(99,102,241,0.3)] text-xs font-semibold text-[var(--accent-primary-light)]">
            <SlidersHorizontal size={13} />
            <span>Workflow Sequence</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-high-contrast)] tracking-tight">
            How ChainSight AI Works: From Signal to Decision
          </h2>
          <p className="text-base text-[var(--text-secondary)] leading-relaxed">
            A simple, five-step operational pipeline that turns complex logistics turbulence into clear, confidence-backed shipping decisions.
          </p>
        </div>

        {/* 5-Step Progress Stepper Navigation */}
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isActive = activeStep === idx;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => setActiveStep(idx)}
                className={`p-3.5 rounded-xl border text-left transition-all relative ${
                  isActive
                    ? "bg-[var(--surface-elevated)] border-[var(--accent-primary)] shadow-[0_0_20px_rgba(99,102,241,0.25)] ring-1 ring-[var(--accent-primary)]"
                    : "bg-[var(--surface-base)] border-[var(--border-color)] hover:border-[var(--border-active)]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isActive
                        ? "bg-[var(--accent-primary)] text-white"
                        : "bg-[var(--surface-overlay)] text-[var(--text-dim)]"
                    }`}
                  >
                    {s.step}
                  </span>
                  <Icon
                    size={16}
                    className={isActive ? "text-[var(--accent-primary-light)]" : "text-[var(--text-dim)]"}
                  />
                </div>
                <div className="text-xs font-bold text-[var(--text-high-contrast)]">{s.name}</div>
                <div className="text-[10px] text-[var(--text-dim)] truncate mt-0.5">
                  {idx === 0 && "Signal ingestion"}
                  {idx === 1 && "Risk recognition"}
                  {idx === 2 && "Agent modeling"}
                  {idx === 3 && "Corridor ranking"}
                  {idx === 4 && "Human sign-off"}
                </div>
              </button>
            );
          })}
        </div>

        {/* Detailed Step Interactive Showcase */}
        <div className="mt-8 rounded-2xl border border-[var(--border-active)] bg-[var(--surface-base)] p-6 sm:p-10 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Narrative (6 cols) */}
            <div className="lg:col-span-6 space-y-5">
              <span className="cs-pill cs-pill-blue text-xs font-bold uppercase tracking-wider">
                {currentStep.badge}
              </span>

              <h3 className="text-2xl sm:text-3xl font-bold text-[var(--text-high-contrast)] leading-tight">
                {currentStep.title}
              </h3>

              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {currentStep.summary}
              </p>

              <div className="p-3.5 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)] text-xs text-[var(--text-body)] flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-[var(--status-success)] shrink-0 mt-0.5" />
                <span className="leading-relaxed">{currentStep.actionText}</span>
              </div>
            </div>

            {/* Right Interactive Telemetry Visual (6 cols) */}
            <div className="lg:col-span-6">
              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-card)] p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between text-xs pb-3 border-b border-[var(--border-color)]">
                  <span className="font-semibold text-[var(--text-high-contrast)] flex items-center gap-2">
                    <currentStep.icon size={15} className="text-[var(--accent-primary-light)]" />
                    Operational Payload: {currentStep.preview.type}
                  </span>
                  <span className="text-[10px] text-[var(--accent-cyan)] font-mono">
                    VERIFIED ENGINE STAGE
                  </span>
                </div>

                <div className="space-y-3">
                  {currentStep.preview.details.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-[var(--surface-base)] border border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs"
                    >
                      <span className="text-[var(--text-secondary)] font-medium">{item.label}</span>
                      <span className="font-bold text-[var(--text-high-contrast)] font-mono sm:text-right">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 text-[11px] text-[var(--text-dim)] flex items-center justify-between">
                  <span>Phase {currentStep.step} of 5 &bull; Deterministic execution</span>
                  <span className="text-[var(--accent-primary-light)] font-semibold">
                    Human-in-the-Loop Verified &check;
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

