import { Link } from "react-router-dom";
import { Ship } from "lucide-react";

export default function LandingFooter() {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="bg-[var(--surface-base)] border-t border-[var(--border-color)] py-14 text-xs font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand Info (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-cyan)] flex items-center justify-center shadow-[0_0_12px_rgba(99,102,241,0.4)]">
                <Ship size={18} className="text-white" />
              </div>
              <span className="text-base font-bold text-[var(--text-high-contrast)]">
                ChainSight AI
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-sm">
              An AI-powered supply chain intelligence and decision-support platform designed to monitor maritime operations, assess disruption risks, and deliver explainable route alternatives.
            </p>
            <div className="text-[11px] text-[var(--text-dim)]">
              Academic Capstone & AI System Implementation
            </div>
          </div>

          {/* Platform Navigation (2 cols) */}
          <div className="md:col-span-2 space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-high-contrast)]">
              Platform
            </div>
            <ul className="space-y-2 text-[var(--text-secondary)]">
              <li>
                <button
                  onClick={() => scrollTo("product-overview")}
                  className="hover:text-white transition-colors"
                >
                  Command Deck
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo("capabilities")}
                  className="hover:text-white transition-colors"
                >
                  Capabilities
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo("how-it-works")}
                  className="hover:text-white transition-colors"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo("technology")}
                  className="hover:text-white transition-colors"
                >
                  Technology
                </button>
              </li>
            </ul>
          </div>

          {/* Capabilities (3 cols) */}
          <div className="md:col-span-3 space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-high-contrast)]">
              Core Modules
            </div>
            <ul className="space-y-2 text-[var(--text-secondary)]">
              <li>Supply Chain Visibility</li>
              <li>Disruption & Port Intelligence</li>
              <li>LangGraph Multi-Agent Workflows</li>
              <li>Chroma Vector Memory Retrieval</li>
              <li>Multi-Criteria Route Optimization</li>
            </ul>
          </div>

          {/* Access (2 cols) */}
          <div className="md:col-span-2 space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-high-contrast)]">
              Account
            </div>
            <ul className="space-y-2 text-[var(--text-secondary)]">
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Notice */}
        <div className="mt-12 pt-6 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[var(--text-dim)]">
          <div>
            &copy; {new Date().getFullYear()} ChainSight AI. Developed for academic presentation and operational intelligence.
          </div>
          <div>
            All rights reserved &bull; Built with React, Tailwind CSS, FastAPI, and LangGraph
          </div>
        </div>
      </div>
    </footer>
  );
}

