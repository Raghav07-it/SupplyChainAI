import { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutGrid,
  AlertTriangle,
  GitBranch,
  RotateCw,
  Sparkles,
  Radio,
  Layers,
  ShieldCheck,
  Clock,
  RefreshCw,
  Bell,
  Activity,
  User,
  Sun,
  Moon,
  Menu,
  X,
  Compass,
} from "lucide-react";

const navItems = [
  {
    name: "Command Center",
    path: "/",
    icon: LayoutGrid,
    badge: null,
  },
  {
    name: "Disruptions",
    path: "/disruptions",
    icon: AlertTriangle,
    badge: { text: "3 Active", className: "bg-red-500/20 text-red-400 border border-red-500/30" },
  },
  {
    name: "Route Analysis",
    path: "/routes",
    icon: GitBranch,
    badge: null,
  },
  {
    name: "Autonomous Rerouting",
    path: "/rerouting",
    icon: RotateCw,
    badge: { text: "AI Action", className: "bg-[#0284c7] text-white font-bold" },
  },
  {
    name: "AI Agents",
    path: "/agents",
    icon: Sparkles,
    badge: { text: "LangGraph", className: "bg-purple-600/30 text-purple-300 border border-purple-500/40" },
  },
  {
    name: "Live Intelligence",
    path: "/live",
    icon: Radio,
    badge: null,
  },
  {
    name: "Operations",
    path: "/operations",
    icon: Layers,
    badge: null,
  },
  {
    name: "System Health",
    path: "/health",
    icon: ShieldCheck,
    badge: { text: "100%", className: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" },
  },
];

function MainLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState("14:02:18 UTC");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const location = useLocation();

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("sc_theme") || "dark";
  });

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.add("light-theme");
    } else {
      document.documentElement.classList.remove("light-theme");
    }
    localStorage.setItem("sc_theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  function handleRefreshData() {
    setIsRefreshing(true);
    const now = new Date();
    const utcHours = String(now.getUTCHours()).padStart(2, "0");
    const utcMinutes = String(now.getUTCMinutes()).padStart(2, "0");
    const utcSeconds = String(now.getUTCSeconds()).padStart(2, "0");
    setTimeout(() => {
      setLastSyncTime(`${utcHours}:${utcMinutes}:${utcSeconds} UTC`);
      setIsRefreshing(false);
    }, 600);
  }

  // Determine top console title based on current path
  const isAgentPage = location.pathname.startsWith("/agents");
  const consoleTitle = isAgentPage ? "Agent Orchestration" : "Global Orchestration";

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] flex overflow-x-hidden font-sans">
      
      {/* =========================================================
          LEFT SIDEBAR (DESKTOP)
          ========================================================= */}
      <aside className="hidden lg:flex w-64 flex-col justify-between shrink-0 bg-[var(--bg-sidebar)] border-r border-[var(--border-color)] fixed top-0 bottom-0 left-0 z-40">
        
        {/* Top: Logo & Platform Label */}
        <div className="flex flex-col">
          <div className="p-4 pb-5 border-b border-[var(--border-color)] flex items-center gap-3">
            <div className="relative group shrink-0">
              <img
                src="/emblem.png"
                alt="SupplyChainAI Emblem"
                className="w-10 h-10 rounded-xl object-contain shadow-[0_0_20px_rgba(56,189,248,0.3)] border border-slate-700/60 group-hover:border-cyan-400 transition-all"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#080C13] shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-[13px] tracking-wider text-white leading-tight font-mono">
                SUPPLYCHAINAI
              </span>
              <span className="text-[9px] font-mono tracking-widest text-cyan-400/90 font-semibold uppercase mt-0.5">
                INTELLIGENCE PLATFORM
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 flex flex-col gap-1.5 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                      isActive
                        ? "bg-[#162032] text-white border border-[#2a3f61] shadow-sm font-semibold"
                        : "text-slate-400 hover:text-slate-200 hover:bg-[#121926]/70"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <Icon
                          size={16}
                          className={`transition-colors ${
                            isActive ? "text-cyan-400" : "text-slate-400 group-hover:text-slate-300"
                          }`}
                        />
                        <span className={isActive ? "text-white font-semibold" : ""}>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${item.badge.className}`}
                        >
                          {item.badge.text}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar Status Widget */}
        <div className="p-4 border-t border-[var(--border-color)] bg-[#090d14]/70">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="text-[10px] font-mono font-bold tracking-wider text-emerald-400 uppercase">
                SYSTEM OPERATIONAL
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 font-semibold">42ms</span>
          </div>
          <div className="text-[10px] font-mono text-slate-500 tracking-tight flex items-center justify-between">
            <span>v2.4.0-prod</span>
            <span>LangGraph Core</span>
          </div>
        </div>

      </aside>

      {/* =========================================================
          MOBILE DRAWER / OVERLAY
          ========================================================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 bg-[#080C13] border-r border-[var(--border-color)] flex flex-col justify-between z-10 p-4">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-3">
                  <img
                    src="/emblem.png"
                    alt="SupplyChainAI Emblem"
                    className="w-8 h-8 rounded-lg object-contain shadow-md border border-slate-700/60"
                  />
                  <div>
                    <div className="font-extrabold text-xs text-white font-mono">SUPPLYCHAINAI</div>
                    <div className="text-[8px] font-mono text-cyan-400">INTELLIGENCE PLATFORM</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="py-4 flex flex-col gap-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === "/"}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium ${
                          isActive
                            ? "bg-[#162032] text-white border border-[#2a3f61]"
                            : "text-slate-400 hover:bg-[#121926]"
                        }`
                      }
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={16} />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${item.badge.className}`}>
                          {item.badge.text}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>
            
            <div className="pt-4 border-t border-[var(--border-color)] text-[10px] font-mono text-slate-400">
              <div className="text-emerald-400 font-bold mb-1">● SYSTEM OPERATIONAL (42ms)</div>
              <div>v2.4.0-prod · LangGraph Core</div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MAIN CONTENT WRAPPER
          ========================================================= */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen min-w-0">
        
        {/* =========================================================
            MISSION CONTROL TOP BAR
            ========================================================= */}
        <header className="sticky top-0 z-30 h-16 bg-[var(--bg-topbar)] backdrop-blur-md border-b border-[var(--border-color)] px-4 sm:px-6 flex items-center justify-between gap-4">
          
          {/* Left: Mobile Toggle & Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-[#121926] border border-[var(--border-color)] text-slate-300"
            >
              <Menu size={16} />
            </button>

            <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
              {/* Cyan Diamond Icon */}
              <div className="w-5 h-5 rounded rotate-45 border border-cyan-400/40 bg-cyan-500/10 flex items-center justify-center">
                <div className="-rotate-45 w-2 h-2 rounded-full bg-cyan-400" />
              </div>
              <span className="text-slate-400 font-medium">Console</span>
              <span className="text-slate-600">/</span>
              <span className="text-slate-200 font-semibold">{consoleTitle}</span>
            </div>
          </div>

          {/* Right: Operational Telemetry Status & User Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Sync UTC Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#101827] border border-[var(--border-color)] font-mono text-[11px] text-emerald-400">
              <Clock size={12} className="text-emerald-400" />
              <span>SYNC {lastSyncTime}</span>
            </div>

            {/* Refresh Data Button */}
            <button
              type="button"
              onClick={handleRefreshData}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#162032] border border-[var(--border-color)] text-xs font-mono font-medium text-slate-300 hover:text-white hover:border-slate-500 transition-all disabled:opacity-50"
            >
              <RefreshCw size={12} className={isRefreshing ? "animate-spin text-cyan-400" : ""} />
              <span className="hidden md:inline">Refresh Data</span>
            </button>

            {/* Notification Bell with Badge */}
            <div className="relative">
              <button
                type="button"
                className="w-8 h-8 rounded-md bg-[#101827] border border-[var(--border-color)] flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
                title="Active alerts (4)"
              >
                <Bell size={14} />
              </button>
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-mono text-[9px] font-bold flex items-center justify-center shadow-sm">
                4
              </span>
            </div>

            {/* TPS Network Pill */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#101827] border border-cyan-500/20 font-mono text-[11px] text-cyan-400">
              <Activity size={12} className="text-cyan-400" />
              <span>99.98% TPS</span>
            </div>

            {/* Avatar Circle */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center text-slate-200 shadow-inner">
              <User size={15} />
            </div>

            {/* Theme Toggle (Subtle) */}
            <button
              type="button"
              onClick={toggleTheme}
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
              className="p-1.5 rounded-md text-slate-500 hover:text-slate-300 transition-colors"
            >
              {theme === "dark" ? <Sun size={14} className="text-amber-400/80" /> : <Moon size={14} />}
            </button>

          </div>

        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1900px] w-full mx-auto">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default MainLayout;