import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Ship,
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Globe,
} from "lucide-react";

export default function Login({ initialMode = "signin" }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState(initialMode); // 'signin' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [market, setMarket] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[var(--canvas-base)] flex items-center justify-center p-4 font-sans antialiased">
      <div className="w-full max-w-md animate-fade-in">
        {/* Main Card */}
        <div className="bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Header & Logo */}
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-[var(--accent-primary)] flex items-center justify-center text-white shadow-[0_0_24px_rgba(99,102,241,0.4)]">
              <Ship size={22} />
            </div>
            <h1 className="text-xl font-bold text-[var(--text-high-contrast)] tracking-wide">
              ChainSight
            </h1>
            <p className="text-xs text-[var(--text-secondary)] max-w-xs leading-relaxed">
              Find the simplest, most cost-effective shipping routes for your business — without the logistics headaches.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex p-1 bg-[var(--surface-base)] rounded-lg border border-[var(--border-color)]">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all ${
                mode === "signin"
                  ? "bg-[var(--surface-overlay)] text-[var(--text-high-contrast)] shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all ${
                mode === "register"
                  ? "bg-[var(--surface-overlay)] text-[var(--text-high-contrast)] shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-white"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Company Name (only in register) */}
            {mode === "register" && (
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Company Name
                </label>
                <div className="relative">
                  <Building2
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)]"
                  />
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Blue Harbor Goods"
                    className="cs-input pl-9 text-xs"
                  />
                </div>
              </div>
            )}

            {/* Work Email */}
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Work Email
              </label>
              <div className="relative">
                <Mail
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)]"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. elena@blueharbor.com"
                  className="cs-input pl-9 text-xs"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">
                  {mode === "register" ? "Create Password" : "Password"}
                </label>
                {mode === "signin" && (
                  <button
                    type="button"
                    className="text-[11px] text-[var(--accent-cyan)] hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)]"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "register" ? "At least 8 characters" : "••••••••"}
                  className="cs-input pl-9 pr-9 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)] hover:text-white"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {mode === "register" && (
                <span className="text-[10px] text-[var(--text-dim)] mt-1 block">
                  ⓘ Must include letters and at least one number
                </span>
              )}
            </div>

            {/* Primary Goods & Export Market (optional, only in register) */}
            {mode === "register" && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[var(--text-secondary)]">
                    Primary Goods & Export Market
                  </label>
                  <span className="text-[10px] text-[var(--text-dim)]">Optional</span>
                </div>
                <div className="relative">
                  <Globe
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)] pointer-events-none"
                  />
                  <select
                    value={market}
                    onChange={(e) => setMarket(e.target.value)}
                    className="cs-select pl-9 text-xs"
                  >
                    <option value="">Select your key trade flow…</option>
                    <option value="ceramics-eu-us">Ceramics & Tiles (Europe → North America)</option>
                    <option value="manufactured-asia-eu">Manufactured Goods (Asia → Europe)</option>
                    <option value="apparel-asia-us">Apparel & Textiles (Asia → North America)</option>
                    <option value="electronics-asia-global">Electronics & Hardware (Asia → Global)</option>
                  </select>
                </div>
                <span className="text-[10px] text-[var(--text-dim)] mt-1 block">
                  Helps us curate initial lane tariffs and route schedules.
                </span>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full cs-btn cs-btn-primary text-xs py-2.5 flex items-center justify-center gap-2"
              >
                <span>
                  {mode === "register"
                    ? "Start Planning Shipments — Free for 30 Days"
                    : "Sign In to Dashboard"}
                </span>
                <ArrowRight size={14} />
              </button>
            </div>
          </form>

          {/* Terms Disclaimer */}
          <p className="text-[10px] text-[var(--text-dim)] text-center leading-normal">
            By continuing, you agree to ChainSight's{" "}
            <span className="text-[var(--text-secondary)] underline cursor-pointer">
              Terms of Trade
            </span>{" "}
            and{" "}
            <span className="text-[var(--text-secondary)] underline cursor-pointer">
              Privacy Policy
            </span>
            .
          </p>

          {/* Trust Value Propositions (Screenshot 4) */}
          <div className="p-3.5 rounded-xl bg-[var(--surface-base)] border border-[var(--border-color)] space-y-2 text-xs">
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <CheckCircle2 size={13} className="text-[var(--status-success)] shrink-0" />
              <span>No credit card needed</span>
            </div>
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <CheckCircle2 size={13} className="text-[var(--status-success)] shrink-0" />
              <span>Plain English route tracking</span>
            </div>
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <CheckCircle2 size={13} className="text-[var(--status-success)] shrink-0" />
              <span>Live port delay alerts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
