import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Ship,
  User,
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Globe,
  Loader2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/Button";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [market, setMarket] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!company.trim()) {
      setError("Please enter your company name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid work email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    try {
      await register({
        email: email.trim(),
        password,
        full_name: fullName.trim(),
        company_name: company.trim(),
      });
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--canvas-base)] flex items-center justify-center p-4 font-sans antialiased text-[var(--text-body)]">
      <div className="w-full max-w-md animate-fade-in my-8">
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
            <Link
              to="/login"
              className="flex-1 py-1.5 rounded-md text-xs font-semibold text-center text-[var(--text-secondary)] hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <button
              type="button"
              className="flex-1 py-1.5 rounded-md text-xs font-semibold bg-[var(--surface-overlay)] text-[var(--text-high-contrast)] shadow-sm cursor-default"
            >
              Create Account
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3 rounded-lg bg-[rgba(239,68,68,0.12)] border border-[rgba(239,68,68,0.3)] flex items-center gap-2.5 text-xs text-[var(--status-critical)]">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="reg-fullname" className="text-xs font-semibold text-[var(--text-secondary)]">
                Full Name
              </Label>
              <div className="relative">
                <User
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)]"
                />
                <Input
                  id="reg-fullname"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Elena Rostova"
                  autoComplete="name"
                  className="bg-[var(--surface-base)] border-[var(--border-color)] pl-9 text-xs text-[var(--text-high-contrast)] h-10 focus-visible:ring-[var(--accent-primary)]"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Company Name */}
            <div className="space-y-1.5">
              <Label htmlFor="reg-company" className="text-xs font-semibold text-[var(--text-secondary)]">
                Company Name
              </Label>
              <div className="relative">
                <Building2
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)]"
                />
                <Input
                  id="reg-company"
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Blue Harbor Goods"
                  autoComplete="organization"
                  className="bg-[var(--surface-base)] border-[var(--border-color)] pl-9 text-xs text-[var(--text-high-contrast)] h-10 focus-visible:ring-[var(--accent-primary)]"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Work Email */}
            <div className="space-y-1.5">
              <Label htmlFor="reg-email" className="text-xs font-semibold text-[var(--text-secondary)]">
                Work Email
              </Label>
              <div className="relative">
                <Mail
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)]"
                />
                <Input
                  id="reg-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. elena@blueharbor.com"
                  autoComplete="email"
                  className="bg-[var(--surface-base)] border-[var(--border-color)] pl-9 text-xs text-[var(--text-high-contrast)] h-10 focus-visible:ring-[var(--accent-primary)]"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Create Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="reg-password" className="text-xs font-semibold text-[var(--text-secondary)]">
                  Create Password
                </Label>
              </div>
              <div className="relative">
                <Lock
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)]"
                />
                <Input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  className="bg-[var(--surface-base)] border-[var(--border-color)] pl-9 pr-9 text-xs text-[var(--text-high-contrast)] h-10 focus-visible:ring-[var(--accent-primary)]"
                  disabled={loading}
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
              <span className="text-[10px] text-[var(--text-dim)] mt-1 block">
                ⓘ Must include letters and at least one number
              </span>
            </div>

            {/* Primary Goods & Export Market (Optional) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-[var(--text-secondary)]">
                  Primary Goods & Export Market
                </Label>
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
                  disabled={loading}
                  className="w-full bg-[var(--surface-base)] border border-[var(--border-color)] rounded-lg pl-9 pr-3 py-2 text-xs text-[var(--text-high-contrast)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all"
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

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white text-xs h-10 font-semibold shadow-md flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Setting up account…</span>
                  </>
                ) : (
                  <>
                    <span>Start Planning Shipments — Free for 30 Days</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </Button>
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

          {/* Trust Value Propositions */}
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
