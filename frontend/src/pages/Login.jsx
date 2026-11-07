import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Ship, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/Button";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    setLoading(true);
    try {
      await login({ email: email.trim(), password });
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--canvas-base)] flex items-center justify-center p-4 font-sans antialiased text-[var(--text-body)]">
      <div className="w-full max-w-md animate-fade-in">
        {/* Main Card matching screenshot */}
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
              className="flex-1 py-1.5 rounded-md text-xs font-semibold bg-[var(--surface-overlay)] text-[var(--text-high-contrast)] shadow-sm cursor-default"
            >
              Sign In
            </button>
            <Link
              to="/register"
              className="flex-1 py-1.5 rounded-md text-xs font-semibold text-center text-[var(--text-secondary)] hover:text-white transition-colors"
            >
              Create Account
            </Link>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-[rgba(239,68,68,0.12)] border border-[rgba(239,68,68,0.3)] flex items-center gap-2.5 text-xs text-[var(--status-critical)]">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Work Email */}
            <div className="space-y-1.5">
              <Label htmlFor="login-email" className="text-xs font-semibold text-[var(--text-secondary)]">
                Work Email
              </Label>
              <div className="relative">
                <Mail
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)]"
                />
                <Input
                  id="login-email"
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

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password" className="text-xs font-semibold text-[var(--text-secondary)]">
                  Password
                </Label>
                <span className="text-[11px] text-[var(--accent-cyan)] cursor-pointer hover:underline">
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <Lock
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)]"
                />
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
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
                    <span>Signing in…</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to ChainSight</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Value Propositions from Screenshot */}
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
