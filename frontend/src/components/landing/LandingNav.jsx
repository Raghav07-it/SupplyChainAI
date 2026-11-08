import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Ship, Menu, X, ArrowRight, LayoutDashboard, Shield, Cpu } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function LandingNav() {
  const { isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0B0F17]/90 backdrop-blur-md border-b border-[var(--border-color)] py-3 shadow-xl"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Identity */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-cyan)] flex items-center justify-center shadow-[0_0_16px_rgba(99,102,241,0.45)] group-hover:shadow-[0_0_24px_rgba(99,102,241,0.65)] transition-all">
              <Ship size={20} className="text-white" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-[var(--text-high-contrast)] font-sans">
                ChainSight
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[var(--accent-primary-bg)] text-[var(--accent-primary-light)] border border-[rgba(99,102,241,0.3)]">
                AI
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[var(--text-secondary)]">
            <button
              onClick={() => scrollToSection("product-overview")}
              className="hover:text-[var(--text-high-contrast)] transition-colors focus:outline-none"
            >
              Product
            </button>
            <button
              onClick={() => scrollToSection("capabilities")}
              className="hover:text-[var(--text-high-contrast)] transition-colors focus:outline-none"
            >
              Capabilities
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="hover:text-[var(--text-high-contrast)] transition-colors focus:outline-none"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection("technology")}
              className="hover:text-[var(--text-high-contrast)] transition-colors focus:outline-none"
            >
              Technology
            </button>
            <button
              onClick={() => scrollToSection("differentiators")}
              className="hover:text-[var(--text-high-contrast)] transition-colors focus:outline-none"
            >
              Why ChainSight
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="cs-btn cs-btn-primary text-xs py-2 px-4 shadow-lg shadow-indigo-500/20 flex items-center gap-2"
              >
                <LayoutDashboard size={14} />
                <span>Go to Dashboard</span>
                <ArrowRight size={13} />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-secondary)] hover:text-white hover:bg-[var(--surface-overlay)] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="cs-btn cs-btn-primary text-xs py-2 px-4 shadow-lg shadow-indigo-500/25 flex items-center gap-1.5"
                >
                  <span>Get Started Free</span>
                  <ArrowRight size={13} />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-[var(--surface-base)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-white focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0B0F17]/98 border-b border-[var(--border-color)] px-4 pt-3 pb-6 space-y-4 animate-fade-in backdrop-blur-xl">
          <nav className="flex flex-col space-y-3 text-sm font-medium text-[var(--text-secondary)]">
            <button
              onClick={() => scrollToSection("product-overview")}
              className="text-left py-1 hover:text-white"
            >
              Product Overview
            </button>
            <button
              onClick={() => scrollToSection("capabilities")}
              className="text-left py-1 hover:text-white"
            >
              Core Capabilities
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="text-left py-1 hover:text-white"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection("technology")}
              className="text-left py-1 hover:text-white"
            >
              AI & Technology Architecture
            </button>
            <button
              onClick={() => scrollToSection("differentiators")}
              className="text-left py-1 hover:text-white"
            >
              Why ChainSight AI
            </button>
          </nav>

          <div className="pt-4 border-t border-[var(--border-color)] flex flex-col gap-2.5">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="w-full cs-btn cs-btn-primary text-xs justify-center py-2.5"
              >
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="w-full cs-btn cs-btn-secondary text-xs justify-center py-2.5"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="w-full cs-btn cs-btn-primary text-xs justify-center py-2.5"
                >
                  Get Started Free →
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
