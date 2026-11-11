import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Ship,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Globe,
  Compass,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please fill in both work email and password.");
      return;
    }

    setLoading(true);
    try {
      await login({ email: email.trim(), password });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#060B17] via-[#0D1527] to-[#121E36] flex items-center justify-center p-4 font-sans antialiased text-[#E5E7EB] relative overflow-hidden">
      {/* Decorative Logistics Grid & Glowing Arcs Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <svg
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
        >
          <defs>
            <pattern
              id="grid-pattern"
              width="48"
              height="48"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 48 0 L 0 0 0 48"
                fill="none"
                stroke="rgba(99, 102, 241, 0.12)"
                strokeWidth="1"
              />
            </pattern>
            <linearGradient id="route-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#6366F1" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          {/* Subtle curved global transit lane lines */}
          <path
            d="M -100 200 C 300 100, 700 500, 1500 250"
            fill="none"
            stroke="url(#route-gradient)"
            strokeWidth="2"
            strokeDasharray="6 6"
          />
          <path
            d="M 100 700 C 500 400, 900 650, 1600 450"
            fill="none"
            stroke="url(#route-gradient)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
        </svg>
      </div>

      {/* Radial soft lighting behind card */}
      <div className="absolute w-[600px] h-[600px] bg-gradient-to-tr from-indigo-600/15 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none -top-24 -left-24" />
      <div className="absolute w-[500px] h-[500px] bg-gradient-to-br from-blue-600/15 via-purple-600/10 to-transparent rounded-full blur-3xl pointer-events-none -bottom-24 -right-24" />

      {/* Main Glassmorphic Container */}
      <div className="w-full max-w-md relative z-10 animate-fade-in my-8">
        <div className="bg-[#0F172A]/90 backdrop-blur-2xl border border-[#273B5E] rounded-3xl p-7 sm:p-9 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] space-y-6">
          {/* Header & Logo */}
          <div className="flex flex-col items-center text-center space-y-2">
            <Link
              to="/"
              className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#4F46E5] to-[#6366F1] flex items-center justify-center text-white shadow-[0_0_25px_rgba(99,102,241,0.45)] hover:scale-105 transition-transform"
            >
              <Ship size={26} />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight pt-1">
              ChainSight <span className="text-[#38BDF8]">AI</span>
            </h1>
            <p className="text-sm text-[#94A3B8] max-w-xs leading-relaxed">
              Autonomous global maritime intelligence & multi-agent route optimization.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex p-1 bg-[#0A101D] rounded-xl border border-[#223554]">
            <button
              type="button"
              className="flex-1 py-2 rounded-lg text-sm font-bold bg-[#1E293B] text-white shadow-sm cursor-default"
            >
              Sign In
            </button>
            <Link
              to="/register"
              className="flex-1 py-2 rounded-lg text-sm font-semibold text-center text-[#94A3B8] hover:text-white transition-colors"
            >
              Create Account
            </Link>
          </div>

          {/* Error Message Banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/12 border border-red-500/35 flex items-center gap-3 text-xs sm:text-sm text-red-400">
              <AlertCircle size={16} className="shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Work Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="block text-sm font-semibold text-[#E2E8F0]"
              >
                Work Email
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]"
                />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. operator@supplychain.com"
                  autoComplete="email"
                  className="w-full bg-[#0A101D] border border-[#223554] rounded-xl pl-10 pr-4 py-2.5 text-base text-white placeholder-[#64748B] focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="block text-sm font-semibold text-[#E2E8F0]"
                >
                  Password
                </label>
                <span className="text-xs text-[#38BDF8] cursor-pointer hover:underline font-medium">
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]"
                />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full bg-[#0A101D] border border-[#223554] rounded-xl pl-10 pr-11 py-2.5 text-base text-white placeholder-[#64748B] focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#223554] bg-[#0A101D] text-[#6366F1] focus:ring-[#6366F1]/30 cursor-pointer"
                />
                <span className="text-xs text-[#94A3B8]">Remember me on this workstation</span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#6366F1] hover:brightness-110 text-white text-base font-bold shadow-[0_0_20px_rgba(99,102,241,0.35)] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Signing in…</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Command Center</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Value Propositions */}
          <div className="p-4 rounded-xl bg-[#0A101D] border border-[#223554] space-y-2 text-xs text-[#94A3B8]">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={15} className="text-[#10B981] shrink-0" />
              <span>Multi-agent autonomous rerouting & risk scoring</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={15} className="text-[#10B981] shrink-0" />
              <span>Free MapLibre global vector map (no AI key needed)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={15} className="text-[#10B981] shrink-0" />
              <span>Live port congestion, strike & storm advisories</span>
            </div>
          </div>

          <div className="text-center pt-1">
            <Link
              to="/"
              className="text-xs text-[#64748B] hover:text-[#38BDF8] transition-colors inline-flex items-center gap-1.5"
            >
              ← Return to ChainSight Marketing Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
