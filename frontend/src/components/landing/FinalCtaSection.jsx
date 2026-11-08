import { Link } from "react-router-dom";
import { ArrowRight, LogIn, Ship, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function FinalCtaSection() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="py-24 bg-gradient-to-b from-[var(--canvas-base)] via-[#0e1522] to-[var(--canvas-base)] relative border-t border-[var(--border-color)] overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-cyan)] flex items-center justify-center text-white mx-auto shadow-[0_0_30px_rgba(99,102,241,0.5)]">
          <Ship size={28} />
        </div>

        <div className="space-y-4 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--text-high-contrast)] leading-tight">
            Make Every Supply Chain Decision More Informed.
          </h2>
          <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto">
            ChainSight AI unifies end-to-end cargo visibility, live port radar, and explainable multi-agent decision support into a single, intuitive platform.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="w-full sm:w-auto cs-btn cs-btn-primary text-sm py-3.5 px-8 shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 group font-semibold"
            >
              <span>Go to Your Dashboard</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="w-full sm:w-auto cs-btn cs-btn-primary text-sm py-3.5 px-8 shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 group font-semibold"
              >
                <span>Get Started Free</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-6 py-3.5 rounded-lg text-sm font-semibold bg-[var(--surface-base)] hover:bg-[var(--surface-overlay)] text-[var(--text-high-contrast)] border border-[var(--border-color)] hover:border-[var(--border-active)] transition-all flex items-center justify-center gap-2"
              >
                <LogIn size={15} />
                <span>Sign In to Platform</span>
              </Link>
            </>
          )}
        </div>

        <div className="pt-4 flex items-center justify-center gap-2 text-xs text-[var(--text-dim)]">
          <ShieldCheck size={14} className="text-[var(--status-success)]" />
          <span>Zero credit card required &bull; 100% clean, isolated tenant workspace</span>
        </div>
      </div>
    </section>
  );
}
