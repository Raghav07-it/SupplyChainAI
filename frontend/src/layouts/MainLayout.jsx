import { useState, useRef, useEffect, useCallback } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  Package,
  Ship,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Search,
  Bell,
  HelpCircle,
  Menu,
  X,
  Cpu,
  Radio,
  Activity,
  SlidersHorizontal,
  Compass,
  LogOut,
  User as UserIcon,
  Building,
  Settings as SettingsIcon,
  Loader2,
  Anchor,
  Box,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { searchGlobal } from "../api/search";
import { getMyRouteAlerts } from "../api/alerts";

export default function MainLayout() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [unreadAlertsCount, setUnreadAlertsCount] = useState(0);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);
  const searchContainerRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Load unread alerts count
  const loadAlerts = useCallback(async () => {
    try {
      const alerts = await getMyRouteAlerts();
      if (Array.isArray(alerts)) {
        const unread = alerts.filter((a) => !a.is_read && !a.is_acknowledged).length;
        setUnreadAlertsCount(unread);
      }
    } catch {
      // non-blocking
    }
  }, []);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts, location.pathname]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setSearchDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
      setSearchDropdownOpen(false);
      return;
    }

    setSearchLoading(true);
    setSearchDropdownOpen(true);

    const timer = setTimeout(async () => {
      try {
        const res = await searchGlobal(searchTerm);
        setSearchResults(res.results || []);
      } catch (err) {
        console.warn("Global search failed:", err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchDropdownOpen(false);
      navigate(`/my-shipments?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleSelectSearchResult = (link) => {
    setSearchDropdownOpen(false);
    setSearchTerm("");
    navigate(link);
  };

  const handleLogout = () => {
    setProfileDropdownOpen(false);
    logout();
    navigate("/login");
  };

  // Derive display names and initials
  const fullName = user?.full_name || "User";
  const companyName = user?.company_name || "Supplier Organization";
  const initials =
    fullName
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "CS";

  const primaryNav = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutGrid },
    { name: "My Products", path: "/products", icon: Package },
    { name: "Plan Shipment", path: "/plan-shipment", icon: Ship },
    { name: "My Shipments", path: "/my-shipments", icon: Ship },
    {
      name: "Alerts",
      path: "/alerts",
      icon: AlertTriangle,
      badge: unreadAlertsCount > 0 ? unreadAlertsCount : null,
    },
    { name: "Settings", path: "/settings", icon: SettingsIcon },
  ];

  const technicalNav = [
    { name: "AI Agents", path: "/agents", icon: Cpu },
    { name: "Disruptions", path: "/disruptions", icon: AlertTriangle },
    { name: "Live Intelligence", path: "/live", icon: Radio },
    { name: "Operations", path: "/operations", icon: SlidersHorizontal },
    { name: "System Health", path: "/health", icon: Activity },
    { name: "Route Analysis", path: "/routes", icon: Compass },
  ];

  const getCategoryIcon = (category) => {
    switch (category) {
      case "shipment":
        return <Ship size={14} className="text-[var(--accent-primary-light)]" />;
      case "product":
        return <Box size={14} className="text-[var(--accent-cyan)]" />;
      case "port":
        return <Anchor size={14} className="text-emerald-400" />;
      case "disruption":
        return <AlertTriangle size={14} className="text-[var(--status-critical)]" />;
      default:
        return <Search size={14} className="text-[var(--text-dim)]" />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--canvas-base)] text-[var(--text-body)] flex font-sans antialiased">
      {/* =========================================================
          Desktop Fixed Sidebar (240px wide)
          ========================================================= */}
      <aside className="hidden lg:flex w-60 flex-col justify-between shrink-0 bg-[var(--surface-base)] border-r border-[var(--border-color)] fixed top-0 bottom-0 left-0 z-40 select-none">
        <div className="overflow-y-auto">
          {/* Brand Header */}
          <div className="px-5 py-4 border-b border-[var(--border-color)] flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)] flex items-center justify-center shadow-[0_0_12px_rgba(99,102,241,0.4)]">
              <Ship size={17} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-[var(--text-high-contrast)] tracking-wide">
                ChainSight
              </span>
            </div>
          </div>

          {/* Section: Operations */}
          <div className="px-5 pt-5 pb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-dim)]">
              Operations
            </span>
          </div>

          {/* Core Navigation Items */}
          <nav className="px-3 flex flex-col gap-1">
            {primaryNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/dashboard"}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-md text-[13px] font-medium transition-colors ${
                      isActive
                        ? "bg-[var(--accent-primary)] text-white shadow-[0_0_14px_rgba(99,102,241,0.3)]"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-high-contrast)] hover:bg-[var(--surface-elevated)]"
                    }`
                  }
                >
                  <span className="flex items-center gap-2.5">
                    <Icon size={16} />
                    {item.name}
                  </span>
                  {item.badge !== null && item.badge !== undefined && (
                    <span className="min-w-4 h-4 px-1 rounded-full bg-[var(--status-critical)] text-white text-[10px] font-bold flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Section: Collapsed Admin / Technical Group */}
          <div className="px-3 mt-6 pt-3 border-t border-[var(--border-color)]">
            <button
              type="button"
              onClick={() => setAdminOpen(!adminOpen)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-[var(--text-dim)] uppercase tracking-wider hover:text-[var(--text-secondary)] transition-colors"
            >
              <span>Admin / Technical</span>
              {adminOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>

            {adminOpen && (
              <div className="mt-1 flex flex-col gap-0.5">
                {technicalNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs transition-colors ${
                          isActive
                            ? "bg-[var(--surface-elevated)] text-[var(--accent-cyan)] font-medium"
                            : "text-[var(--text-secondary)] hover:text-white hover:bg-[var(--surface-elevated)]"
                        }`
                      }
                    >
                      <Icon size={14} />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* User Profile Card */}
        <div className="p-3 border-t border-[var(--border-color)] bg-[var(--surface-base)] relative">
          <button
            type="button"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-[var(--surface-elevated)] cursor-pointer transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-[var(--text-high-contrast)] truncate">
                {fullName}
              </div>
              <div className="text-[11px] text-[var(--text-secondary)] truncate">
                {companyName}
              </div>
            </div>
            <ChevronDown size={14} className="text-[var(--text-dim)] shrink-0" />
          </button>
        </div>
      </aside>

      {/* =========================================================
          Mobile Drawer
          ========================================================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-64 bg-[var(--surface-base)] border-r border-[var(--border-color)] flex flex-col justify-between z-10 p-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)] flex items-center justify-center">
                    <Ship size={17} className="text-white" />
                  </div>
                  <span className="font-bold text-sm text-[var(--text-high-contrast)]">
                    ChainSight
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded text-[var(--text-secondary)] hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="py-4 flex flex-col gap-1">
                {primaryNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === "/dashboard"}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-[var(--accent-primary)] text-white"
                            : "text-[var(--text-secondary)] hover:text-white hover:bg-[var(--surface-elevated)]"
                        }`
                      }
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon size={16} />
                        {item.name}
                      </span>
                      {item.badge !== null && item.badge !== undefined && (
                        <span className="min-w-4 h-4 px-1 rounded-full bg-[var(--status-critical)] text-white text-[10px] font-bold flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </nav>

              <div className="pt-2 border-t border-[var(--border-color)]">
                <div className="px-3 py-1 text-[11px] font-semibold text-[var(--text-dim)] uppercase">
                  Admin / Technical
                </div>
                {technicalNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:text-white"
                    >
                      <Icon size={14} />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border-color)]">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                  {initials}
                </div>
                <div className="text-xs min-w-0">
                  <div className="font-semibold text-white truncate">{fullName}</div>
                  <div className="text-[11px] text-[var(--text-secondary)] truncate">{companyName}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-[var(--surface-elevated)] hover:bg-[var(--surface-overlay)] text-xs text-[var(--status-critical)] transition-colors"
              >
                <LogOut size={14} />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          Main Content Column
          ========================================================= */}
      <div className="flex-1 lg:pl-60 flex flex-col min-h-screen min-w-0">
        {/* Sticky Top Bar */}
        <header className="sticky top-0 z-30 h-14 bg-[var(--bg-topbar)] backdrop-blur-md border-b border-[var(--border-color)] px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* Left: Mobile Toggle & Breadcrumbs with User Company */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-md bg-[var(--surface-elevated)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-white"
              aria-label="Toggle navigation"
            >
              <Menu size={16} />
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className="text-[var(--text-secondary)] font-medium">ChainSight</span>
              <span className="text-[var(--border-active)]">/</span>
              <span className="text-[var(--text-secondary)]">Supplier Portal</span>
              <span className="text-[var(--border-active)]">/</span>
              <span className="font-semibold text-[var(--text-high-contrast)]">
                {companyName}
              </span>
            </div>
          </div>

          {/* Middle: Functional Search Bar with Live Dropdown */}
          <div className="flex-1 max-w-md mx-2 sm:mx-4 relative" ref={searchContainerRef}>
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                {searchLoading ? (
                  <Loader2
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--accent-primary-light)] animate-spin"
                  />
                ) : (
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)]"
                  />
                )}
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => {
                    if (searchResults.length > 0 || searchTerm.trim()) {
                      setSearchDropdownOpen(true);
                    }
                  }}
                  placeholder="Search tracking ID, BOL, SKU, port, disruption…"
                  className="w-full bg-[var(--surface-base)] border border-[var(--border-color)] rounded-md pl-9 pr-3 py-1.5 text-xs text-[var(--text-high-contrast)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all"
                />
              </div>
            </form>

            {/* Global Search Dropdown */}
            {searchDropdownOpen && (
              <div className="absolute left-0 right-0 top-10 mt-1 bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-xl shadow-2xl p-2 z-50 max-h-96 overflow-y-auto animate-fade-in text-xs">
                {searchLoading && (
                  <div className="p-3 text-center text-[var(--text-dim)] flex items-center justify-center gap-2">
                    <Loader2 size={13} className="animate-spin text-[var(--accent-cyan)]" />
                    <span>Searching workspace records…</span>
                  </div>
                )}

                {!searchLoading && searchResults.length === 0 && (
                  <div className="p-4 text-center text-[var(--text-secondary)]">
                    No matching shipments, products, or disruptions found for "{searchTerm}".
                  </div>
                )}

                {!searchLoading && searchResults.length > 0 && (
                  <div className="space-y-1">
                    <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-dim)] flex items-center justify-between">
                      <span>Matching Records</span>
                      <span>{searchResults.length} found</span>
                    </div>
                    {searchResults.map((item, idx) => (
                      <button
                        key={`${item.category}-${item.id}-${idx}`}
                        type="button"
                        onClick={() => handleSelectSearchResult(item.link)}
                        className="w-full flex items-start gap-2.5 p-2 rounded-lg hover:bg-[var(--surface-overlay)] transition-colors text-left group"
                      >
                        <div className="mt-0.5 shrink-0 p-1.5 rounded-md bg-[var(--surface-base)] border border-[var(--border-color)]">
                          {getCategoryIcon(item.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[var(--text-high-contrast)] truncate group-hover:text-[var(--accent-cyan)]">
                              {item.title}
                            </span>
                            {item.badge && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--surface-base)] border border-[var(--border-color)] text-[var(--text-secondary)]">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[var(--text-secondary)] truncate">
                            {item.subtitle}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Actions & User Profile Dropdown */}
          <div className="flex items-center gap-2 relative" ref={dropdownRef}>
            <NavLink
              to="/alerts"
              className="relative w-8 h-8 rounded-md bg-[var(--surface-elevated)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] hover:text-white transition-colors"
              title="Alerts"
            >
              <Bell size={15} />
              {unreadAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-3.5 h-3.5 px-0.5 rounded-full bg-[var(--status-critical)] text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadAlertsCount}
                </span>
              )}
            </NavLink>

            <button
              type="button"
              onClick={() => navigate("/health")}
              className="w-8 h-8 rounded-md bg-[var(--surface-elevated)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] hover:text-white transition-colors"
              title="System Health & Status"
            >
              <HelpCircle size={15} />
            </button>

            {/* Account Profile Button with Dropdown Trigger */}
            <button
              type="button"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full bg-[var(--surface-elevated)] border border-[var(--border-color)] hover:border-[var(--accent-primary)] transition-all cursor-pointer"
              title="Account Menu"
              aria-label="User Account Menu"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                {initials}
              </div>
              <span className="hidden md:inline text-xs font-medium text-[var(--text-high-contrast)] max-w-[120px] truncate">
                {fullName}
              </span>
              <ChevronDown size={13} className="text-[var(--text-secondary)]" />
            </button>

            {/* Profile Dropdown Menu */}
            {profileDropdownOpen && (
              <div className="absolute right-0 top-12 w-64 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)] shadow-2xl py-2 z-50 animate-fade-in text-xs">
                {/* User Info Header */}
                <div className="px-4 py-3 border-b border-[var(--border-color)]">
                  <div className="font-semibold text-sm text-[var(--text-high-contrast)] truncate">
                    {fullName}
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] truncate mt-0.5">
                    {user?.email}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--surface-overlay)] text-[10px] text-[var(--accent-cyan)] font-medium border border-[var(--border-color)]">
                      <Building size={11} />
                      <span className="truncate max-w-[140px]">{companyName}</span>
                    </span>
                    <span className="inline-block px-1.5 py-0.5 rounded bg-[rgba(99,102,241,0.15)] text-[10px] text-[var(--accent-primary-light)] font-medium capitalize">
                      {user?.role || "supplier"}
                    </span>
                  </div>
                </div>

                {/* Account Navigation / Links */}
                <div className="py-1">
                  <NavLink
                    to="/dashboard"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-[var(--text-secondary)] hover:text-white hover:bg-[var(--surface-overlay)] transition-colors"
                  >
                    <LayoutGrid size={14} />
                    <span>Dashboard</span>
                  </NavLink>
                  <NavLink
                    to="/settings"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-[var(--text-secondary)] hover:text-white hover:bg-[var(--surface-overlay)] transition-colors"
                  >
                    <SettingsIcon size={14} />
                    <span>Settings & Security</span>
                  </NavLink>
                  <NavLink
                    to="/home"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-[var(--text-secondary)] hover:text-white hover:bg-[var(--surface-overlay)] transition-colors"
                  >
                    <Compass size={14} />
                    <span>Marketing Homepage</span>
                  </NavLink>
                </div>

                {/* Logout Button */}
                <div className="pt-1 border-t border-[var(--border-color)]">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-[var(--status-critical)] hover:bg-[rgba(239,68,68,0.1)] transition-colors font-medium text-left"
                  >
                    <LogOut size={14} />
                    <span>Log out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1440px] w-full mx-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
