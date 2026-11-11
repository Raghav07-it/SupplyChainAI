import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Globe,
  Radio,
  Search,
  RefreshCw,
  AlertTriangle,
  Ship,
  ExternalLink,
  MapPin,
  Clock,
  Sparkles,
  ShieldCheck,
  Layers,
  ArrowRight,
  Filter,
} from "lucide-react";
import GlobalLogisticsMap from "../components/map/GlobalLogisticsMap";
import { getShipments } from "../api/shipments";
import { getMyRouteAlerts, getAllDisruptions } from "../api/alerts";
import { getLiveNews, getLiveWeather } from "../api/live";
import LoadingSpinner from "../components/ui/LoadingSpinner";

export default function GlobalIntelligence() {
  const [shipments, setShipments] = useState([]);
  const [disruptions, setDisruptions] = useState([]);
  const [routeAlerts, setRouteAlerts] = useState([]);
  const [newsArticles, setNewsArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // News Filtering & Search
  const [newsCategory, setNewsCategory] = useState("all"); // 'all' | 'geopolitical' | 'congestion' | 'canal' | 'infrastructure'
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedShipment, setSelectedShipment] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [shipmentsRes, alertsRes, disruptionsRes, newsRes] = await Promise.allSettled([
        getShipments(),
        getMyRouteAlerts(),
        getAllDisruptions(),
        getLiveNews({ maxResults: 10 }),
      ]);

      if (shipmentsRes.status === "fulfilled") {
        setShipments(Array.isArray(shipmentsRes.value) ? shipmentsRes.value : []);
      }
      if (alertsRes.status === "fulfilled") {
        setRouteAlerts(Array.isArray(alertsRes.value) ? alertsRes.value : []);
      }
      if (disruptionsRes.status === "fulfilled") {
        setDisruptions(Array.isArray(disruptionsRes.value) ? disruptionsRes.value : []);
      }
      if (newsRes.status === "fulfilled") {
        setNewsArticles(newsRes.value?.articles || []);
      }
    } catch (err) {
      console.warn("Could not load global intelligence telemetry:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  // Filter news articles based on category and search query
  const filteredNews = newsArticles.filter((article) => {
    const matchesCategory =
      newsCategory === "all" ||
      (newsCategory === "geopolitical" && (article.event_type?.includes("geopolitical") || article.title.toLowerCase().includes("red sea"))) ||
      (newsCategory === "congestion" && (article.event_type?.includes("congestion") || article.title.toLowerCase().includes("dwell") || article.title.toLowerCase().includes("port"))) ||
      (newsCategory === "canal" && (article.event_type?.includes("canal") || article.title.toLowerCase().includes("panama") || article.title.toLowerCase().includes("suez"))) ||
      (newsCategory === "infrastructure" && (article.event_type?.includes("infrastructure") || article.title.toLowerCase().includes("channel") || article.title.toLowerCase().includes("berth")));

    if (!matchesCategory) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      article.title.toLowerCase().includes(q) ||
      (article.summary || "").toLowerCase().includes(q) ||
      (article.source || "").toLowerCase().includes(q) ||
      (article.location || "").toLowerCase().includes(q) ||
      (article.operational_impact || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-cyan)] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--status-success)] animate-pulse" />
              GIS Geospatial Telemetry • Maritime Situational Intelligence
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-high-contrast)]">
            Global Logistics Intelligence
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-3xl">
            Live oceanic situational awareness: interactive fleet positioning, strategic maritime chokepoints, and AI supply-chain operational news analysis.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="cs-btn cs-btn-secondary text-xs flex items-center gap-1.5"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing Feed…" : "Sync Live Signals"}
          </button>
          <Link to="/plan-shipment" className="cs-btn cs-btn-primary text-xs">
            Plan New Corridor →
          </Link>
        </div>
      </div>

      {/* =========================================================
          SECTION 1: INTERACTIVE GLOBAL FLEET MAP
          ========================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[var(--text-high-contrast)] flex items-center gap-2">
            <Globe size={18} className="text-[var(--accent-primary-light)]" />
            Global Maritime Corridors & Chokepoint Map
          </h2>
          <span className="text-xs text-[var(--text-secondary)]">
            CartoDB Dark Matter • Geodesic Great-Circle Projections
          </span>
        </div>

        <GlobalLogisticsMap
          shipments={shipments}
          disruptions={disruptions}
          selectedShipmentId={selectedShipment?.id}
          onSelectShipment={(s) => setSelectedShipment(s)}
          height="540px"
        />
      </div>

      {/* =========================================================
          SECTION 2: CORRIDOR RADAR & ACTIVE NOTICES
          ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Active Alerts & Corridors (5 cols) */}
        <div className="lg:col-span-5 cs-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <h2 className="text-sm font-bold text-[var(--text-high-contrast)] flex items-center gap-2">
              <AlertTriangle size={16} className="text-[var(--status-warning)]" />
              Corridor Watchlist & Notices
            </h2>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[var(--status-warning-bg)] text-[var(--status-warning)] border border-[var(--status-warning-border)]">
              {routeAlerts.length} Active Notice{routeAlerts.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="space-y-3">
            {routeAlerts.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-[var(--surface-base)] border border-[var(--border-color)]">
                <ShieldCheck size={28} className="text-[var(--status-success)] mx-auto mb-2" />
                <div className="text-sm font-bold text-[var(--text-high-contrast)]">
                  All Transport Corridors Clear
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Zero canal restrictions, severe storm warnings, or port labor disputes impacting your registered lanes.
                </p>
              </div>
            ) : (
              routeAlerts.map((a) => (
                <div
                  key={a.id}
                  className="p-4 rounded-xl bg-[var(--surface-base)] border border-[var(--border-color)] space-y-2 hover:border-[var(--border-active)] transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--text-high-contrast)]">
                      {a.port}
                    </span>
                    <span
                      className={`cs-pill text-[10px] py-0 px-1.5 uppercase ${
                        a.severity === "critical"
                          ? "cs-pill-red"
                          : a.severity === "medium"
                          ? "cs-pill-amber"
                          : "cs-pill-green"
                      }`}
                    >
                      {a.severity}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {a.title}
                  </p>
                  <div className="text-[11px] text-[var(--text-dim)] pt-1 flex items-center justify-between border-t border-[var(--border-color)] mt-2">
                    <span>
                      Corridor: <strong className="text-[var(--accent-cyan)]">#{a.shipment_ref}</strong>
                    </span>
                    <span>~{a.delay_hours}h estimated delay</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <Link
            to="/alerts"
            className="w-full cs-btn cs-btn-secondary text-xs flex items-center justify-center gap-1.5"
          >
            Manage All Active Advisories
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Right: Real-time Maritime News Intelligence (7 cols) */}
        <div className="lg:col-span-7 cs-card p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-3">
            <div>
              <h2 className="text-sm font-bold text-[var(--text-high-contrast)] flex items-center gap-2">
                <Radio size={16} className="text-[var(--accent-cyan)]" />
                Live Supply Chain News Intelligence
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Curated maritime news with AI-generated operational impact assessments.
              </p>
            </div>
            <span className="cs-pill cs-pill-cyan text-[11px]">
              {filteredNews.length} verified articles
            </span>
          </div>

          {/* Category Filter Chips & Search Bar */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {[
                { id: "all", label: "All News" },
                { id: "geopolitical", label: "Geopolitical & Red Sea" },
                { id: "congestion", label: "Port Congestion" },
                { id: "canal", label: "Canals & Waterways" },
                { id: "infrastructure", label: "Terminal Infrastructure" },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setNewsCategory(c.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    newsCategory === c.id
                      ? "bg-[var(--accent-primary)] text-white"
                      : "bg-[var(--surface-base)] text-[var(--text-secondary)] hover:text-white border border-[var(--border-color)]"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)]"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search headlines, ports, canals, or operational impacts…"
                className="cs-input pl-9 text-xs"
              />
            </div>
          </div>

          {/* News List */}
          <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
            {loading ? (
              <div className="py-12 flex justify-center">
                <LoadingSpinner message="Loading live supply chain intelligence…" />
              </div>
            ) : filteredNews.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-[var(--surface-base)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)]">
                No matching maritime news found for "{searchQuery}".
              </div>
            ) : (
              filteredNews.map((article, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[var(--surface-base)] border border-[var(--border-color)] space-y-3 hover:border-[var(--border-active)] transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-bold text-[var(--text-high-contrast)] leading-snug">
                      {article.title}
                    </h3>
                    <span
                      className={`cs-pill text-[10px] py-0 px-1.5 uppercase shrink-0 ${
                        article.severity === "critical"
                          ? "cs-pill-red"
                          : article.severity === "medium"
                          ? "cs-pill-amber"
                          : "cs-pill-green"
                      }`}
                    >
                      {article.severity || "Notice"}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-dim)]">
                    <span className="font-semibold text-[var(--text-secondary)]">
                      {article.source || "Maritime Wire"}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin size={11} className="text-[var(--accent-cyan)]" />
                      {article.location || "Global Maritime"}
                    </span>
                    {article.affected_port && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-[var(--accent-primary-light)]">
                          Port: {article.affected_port}
                        </span>
                      </>
                    )}
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {article.summary}
                  </p>

                  {/* AI Operational Impact Highlight */}
                  {article.operational_impact && (
                    <div className="p-3 rounded-lg bg-[var(--surface-elevated)] border border-[rgba(99,102,241,0.25)] space-y-1">
                      <div className="text-[11px] font-bold text-[var(--accent-primary-light)] flex items-center gap-1.5 uppercase tracking-wide">
                        <Sparkles size={12} />
                        Why this matters to your supply chain
                      </div>
                      <p className="text-xs text-[var(--text-high-contrast)] leading-relaxed">
                        {article.operational_impact}
                      </p>
                    </div>
                  )}

                  {article.url && (
                    <div className="pt-1 flex justify-end">
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-[var(--accent-cyan)] hover:underline flex items-center gap-1"
                      >
                        Read Full Dispatch
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
