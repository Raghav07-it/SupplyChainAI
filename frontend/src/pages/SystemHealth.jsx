import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Database,
  GitBranch,
  Layers3,
  Newspaper,
  RefreshCw,
  Route,
  Server,
  CloudSun,
  Network,
} from "lucide-react";

import {
  getApiStatus,
  getDatabaseHealth,
  getDatabaseTables,
} from "../api/health";

const EXPECTED_TABLES = [
  "suppliers",
  "products",
  "inventory",
  "warehouses",
  "shipments",
  "ports",
  "routes",
  "disruptions",
];

const SYSTEMS = [
  {
    key: "backend",
    title: "FastAPI Backend",
    description: "Core API service",
    icon: Server,
  },
  {
    key: "database",
    title: "PostgreSQL Database",
    description: "Database connectivity",
    icon: Database,
  },
  {
    key: "tables",
    title: "Database Tables",
    description: "Application schema visibility",
    icon: Layers3,
  },
  {
    key: "vector",
    title: "Vector Memory",
    description: "Historical disruption memory",
    icon: Network,
  },
  {
    key: "news",
    title: "News Intelligence",
    description: "External news intelligence",
    icon: Newspaper,
  },
  {
    key: "weather",
    title: "Weather Intelligence",
    description: "External weather intelligence",
    icon: CloudSun,
  },
  {
    key: "langgraph",
    title: "LangGraph",
    description: "Multi-agent workflow engine",
    icon: GitBranch,
  },
  {
    key: "routing",
    title: "Routing Engine",
    description: "Route optimization services",
    icon: Route,
  },
];

function statusLabel(status) {

  switch (status) {
    case "operational":
      return "Operational";
    case "error":
      return "Unavailable";
    default:
      return "Not Exposed";
  }
}

function statusClasses(status) {
  switch (status) {
    case "operational":
      return {
        badge:
          "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
        icon: "text-emerald-400",
        dot: "bg-emerald-400",
      };

    case "error":
      return {
        badge: "border-red-400/20 bg-red-400/10 text-red-300",
        icon: "text-red-400",
        dot: "bg-red-400",
      };

    default:
      return {
        badge: "border-slate-400/20 bg-slate-400/10 text-slate-300",
        icon: "text-slate-400",
        dot: "bg-slate-400",
      };
  }
}

function SystemCard({ system, status, detail }) {
  const Icon = system.icon;
  const classes = statusClasses(status);

  return (
    <div className="rounded-xl border border-slate-700/40 bg-slate-800/20 backdrop-blur-md p-5 transition-all hover:border-[#38bdf8]/20 group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700/50 bg-slate-800/80 group-hover:border-[#38bdf8]/30 transition-colors">
            <Icon size={18} className="text-slate-300" />
          </div>
          <div>
            <h3 className="text-[13px] font-bold text-gray-100">{system.title}</h3>
            <p className="mt-0.5 text-[10px] font-medium text-slate-500">{system.description}</p>
          </div>
        </div>

        <div className={`flex items-center gap-1.5 rounded border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${classes.badge}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${classes.dot}`} />
          {statusLabel(status)}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-[11px] font-medium text-slate-500 border-t border-slate-700/40 pt-3">
        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${classes.dot}`} />
        {detail}
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, detail }) {
  return (
    <div className="rounded-xl border border-slate-700/40 bg-slate-800/20 backdrop-blur-md p-5 transition-all hover:border-[#38bdf8]/30 hover:shadow-[0_0_20px_rgba(56,189,248,0.08)] group">
      <div className="flex items-start justify-between gap-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-[#38bdf8] transition-colors">{label}</p>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700/80 bg-slate-800/80 group-hover:border-[#38bdf8]/40 transition-colors">
          <Icon size={16} className="text-slate-400 group-hover:text-[#38bdf8] transition-colors" />
        </div>
      </div>
      <p className="mt-5 text-2xl font-bold tracking-tight text-gray-100">{value}</p>
      <p className="mt-1 text-[11px] font-medium text-slate-500">{detail}</p>
    </div>
  );
}

export default function SystemHealth() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [apiStatus, setApiStatus] = useState(null);
  const [databaseStatus, setDatabaseStatus] = useState(null);
  const [tables, setTables] = useState([]);

  const loadHealth = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const results = await Promise.allSettled([
        getApiStatus(),
        getDatabaseHealth(),
        getDatabaseTables(),
      ]);

      const [apiResult, databaseResult, tablesResult] = results;

      if (apiResult.status === "fulfilled") {
        setApiStatus(apiResult.value);
      } else {
        setApiStatus(null);
      }

      if (databaseResult.status === "fulfilled") {
        setDatabaseStatus(databaseResult.value);
      } else {
        setDatabaseStatus(null);
      }

      if (tablesResult.status === "fulfilled") {
        setTables(Array.isArray(tablesResult.value?.tables) ? tablesResult.value.tables : []);
      } else {
        setTables([]);
      }

      const allFailed = results.every(
        (result) => result.status === "rejected"
      );

      if (allFailed) {
        setError(
          "Unable to reach the backend health endpoints. Make sure FastAPI is running."
        );
      }
    } catch (err) {
      setError(
        err?.message ||
          "Unable to load system health information."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    async function initHealth() {
      if (active) {
        await loadHealth();
      }
    }
    initHealth();
    return () => {
      active = false;
    };
  }, [loadHealth]);


  const databaseOperational =
    databaseStatus?.database === "connected";

  const backendOperational =
    apiStatus?.message === "SupplyChainAI API is running";

  const tablesOperational =
    tables.length > 0;

  const expectedTableCoverage = useMemo(() => {
    if (!tables.length) {
      return 0;
    }

    const normalizedTables = new Set(tables.map((table) => table.toLowerCase()));

    const matched = EXPECTED_TABLES.filter((table) =>
      normalizedTables.has(table)
    ).length;

    return Math.round((matched / EXPECTED_TABLES.length) * 100);
  }, [tables]);

  const operationalCount = [
    backendOperational,
    databaseOperational,
    tablesOperational,
  ].filter(Boolean).length;

  const exposedCount = 3;

  return (
    <div className="flex flex-col gap-6 w-full max-w-[2000px] mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between pb-2 border-b border-slate-700/50">
        <div>
           <div className="flex items-center gap-3 mb-1">
             <h1 className="text-2xl font-bold text-gray-100 tracking-tight">System Health</h1>
             <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                <span className="text-[9px] font-bold tracking-wider text-emerald-400 uppercase">Infrastructure Monitor</span>
             </div>
           </div>
           <p className="text-[13px] text-slate-400 max-w-2xl">
             Monitor the availability of the SupplyChainAI backend and the system capabilities exposed through its APIs.
           </p>
        </div>

        <button
          type="button"
          onClick={() => loadHealth(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-2.5 text-sm font-bold text-[#38bdf8] transition hover:border-[#38bdf8]/40 hover:bg-[#38bdf8]/10 disabled:cursor-not-allowed disabled:opacity-60 hover:shadow-[0_0_15px_rgba(56,189,248,0.15)]"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh Health"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">
          <AlertCircle size={19} className="mt-0.5 shrink-0 text-red-400" />
          <div>
            <p className="font-medium">Health check failed</p>
            <p className="mt-1 text-red-200/70">{error}</p>
          </div>
        </div>
      )}

      {/* Overview */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Server}
          label="Backend API"
          value={loading ? "—" : backendOperational ? "Online" : "Unavailable"}
          detail="FastAPI"
        />

        <MetricCard
          icon={Database}
          label="Database"
          value={
            loading
              ? "—"
              : databaseOperational
                ? "Connected"
                : "Unavailable"
          }
          detail="PostgreSQL"
        />

        <MetricCard
          icon={Layers3}
          label="Tables Detected"
          value={loading ? "—" : tables.length}
          detail="Database schema"
        />

        <MetricCard
          icon={Activity}
          label="Exposed Checks"
          value={`${operationalCount}/${exposedCount}`}
          detail="Verified APIs"
        />
      </div>

      {/* System status */}
      <div>
        <div className="mb-4 border-b border-slate-700/40 pb-4">
          <h2 className="text-[14px] font-bold text-gray-100">System Components</h2>
          <p className="mt-1 text-[11px] font-medium text-slate-400">
            Only components supported by verified backend information are marked operational.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {SYSTEMS.map((system) => {
            let status = "not_exposed";
            let detail = "No dedicated backend health endpoint";

            if (system.key === "backend") {
              status = backendOperational ? "operational" : "error";
              detail = backendOperational
                ? "API root responded successfully"
                : "API root did not respond as expected";
            }

            if (system.key === "database") {
              status = databaseOperational ? "operational" : "error";
              detail = databaseOperational
                ? "SELECT 1 connectivity check passed"
                : "Database connectivity check failed";
            }

            if (system.key === "tables") {
              status = tablesOperational ? "operational" : "error";
              detail = tablesOperational
                ? `${tables.length} database tables returned`
                : "No database tables were returned";
            }

            return (
              <SystemCard
                key={system.key}
                system={system}
                status={status}
                detail={detail}
              />
            );
          })}
        </div>
      </div>

      {/* Database details */}
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-xl border border-slate-700/40 bg-slate-800/20 backdrop-blur-md p-6">
          <div className="flex items-center justify-between gap-4 border-b border-slate-700/40 pb-4 mb-6">
            <div>
              <h2 className="text-[14px] font-bold text-gray-100">Database Schema</h2>
              <p className="mt-1 text-[11px] font-medium text-slate-400">Tables returned by the backend inspection endpoint.</p>
            </div>
            <Database size={16} className="text-[#38bdf8]" />
          </div>

          {loading ? (
            <div className="mt-6 space-y-3">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-10 animate-pulse rounded-xl bg-white/[0.04]"
                />
              ))}
            </div>
          ) : tables.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-slate-700/40 p-6 text-center">
              <p className="text-[13px] font-bold text-slate-400">No table information available</p>
              <p className="mt-1 text-[11px] text-slate-500">The backend did not return database table metadata.</p>
            </div>
          ) : (
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              {tables.map((table) => (
                <div key={table} className="flex items-center justify-between rounded-lg border border-slate-700/40 bg-slate-900/60 px-4 py-3 transition-colors hover:border-[#38bdf8]/30">
                  <span className="text-[12px] font-bold text-gray-100 uppercase tracking-wide">{table}</span>
                  <CheckCircle2 size={14} className="text-emerald-400" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-700/40 bg-slate-800/20 backdrop-blur-md p-6">
          <div className="flex items-center gap-3 border-b border-slate-700/40 pb-4 mb-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700/80 bg-slate-800/80">
              <Layers3 size={16} className="text-[#38bdf8]" />
            </div>
            <div>
              <h2 className="text-[14px] font-bold text-gray-100">Schema Coverage</h2>
              <p className="mt-0.5 text-[10px] font-medium text-slate-500">Comparison against core application tables</p>
            </div>
          </div>

          <div className="mt-2">
            <div className="flex items-end justify-between">
              <span className="text-4xl font-bold tracking-tight text-gray-100">
                {loading ? "—" : `${expectedTableCoverage}%`}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">expected core tables</span>
            </div>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-700/60">
              <div
                className="h-full rounded-full bg-[#38bdf8] shadow-[0_0_8px_rgba(56,189,248,0.6)] transition-all duration-700"
                style={{ width: `${loading ? 0 : expectedTableCoverage}%` }}
              />
            </div>

            <p className="mt-5 text-[11px] font-medium leading-5 text-slate-500">
              This is a schema-visibility comparison only. It does not represent database performance, data quality, or application correctness.
            </p>
          </div>
        </div>
      </div>

      {/* Backend information */}
      <div className="rounded-xl border border-slate-700/40 bg-slate-800/20 backdrop-blur-md p-6">
        <div className="flex items-start gap-3 border-b border-slate-700/40 pb-4 mb-6">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-700/80 bg-slate-800/80">
            <Server size={16} className="text-[#38bdf8]" />
          </div>
          <div>
            <h2 className="text-[14px] font-bold text-gray-100">Backend Connectivity</h2>
            <p className="mt-1 text-[11px] font-medium text-slate-400">Current information returned directly by the FastAPI service.</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">API Response</span>
            <span className={`rounded border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
              loading ? "border-slate-700/40 text-slate-500" : backendOperational ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-red-500/30 bg-red-500/10 text-red-400"
            }`}>
              {loading ? "Checking..." : backendOperational ? "Connected" : "Unavailable"}
            </span>
          </div>
          <p className="mt-4 break-words font-mono text-[13px] text-slate-300 border-t border-slate-700/40 pt-4">
            {loading ? "Checking backend..." : apiStatus?.message || "No response available"}
          </p>
        </div>
      </div>

      {/* Transparency notice */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
        <div className="flex items-start gap-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-400" />
          <div>
            <p className="text-[13px] font-bold text-amber-400">Health coverage notice</p>
            <p className="mt-2 text-[11px] font-medium leading-5 text-slate-400">
              Vector Memory, News Intelligence, Weather Intelligence, LangGraph, and Routing Engine do not currently expose dedicated health endpoints in the verified backend interface. They are therefore shown as “Not Exposed” instead of being assigned a fabricated health status.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
