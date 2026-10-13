import { useEffect, useState } from "react";
import {
  Boxes,
  Building2,
  Package,
  Truck,
  Warehouse,
  RefreshCw,
  AlertCircle,
  Database,
  Layers,
} from "lucide-react";

import {
  getSuppliers,
  getProducts,
  getWarehouses,
  getInventory,
  getShipments,
} from "../api/operations";

function Operations() {
  const [data, setData] = useState({
    suppliers: [],
    products: [],
    warehouses: [],
    inventory: [],
    shipments: [],
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function loadOperations(showRefreshState = false) {
    try {
      setError("");

      if (showRefreshState) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [
        suppliers,
        products,
        warehouses,
        inventory,
        shipments,
      ] = await Promise.all([
        getSuppliers(),
        getProducts(),
        getWarehouses(),
        getInventory(),
        getShipments(),
      ]);

      setData({
        suppliers: Array.isArray(suppliers) ? suppliers : [],
        products: Array.isArray(products) ? products : [],
        warehouses: Array.isArray(warehouses) ? warehouses : [],
        inventory: Array.isArray(inventory) ? inventory : [],
        shipments: Array.isArray(shipments) ? shipments : [],
      });
    } catch (err) {
      console.error("Operations data error:", err);
      setError(
        err.message ||
          "Unable to load operational data from the backend."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    let active = true;
    async function initOperations() {
      if (active) {
        await loadOperations();
      }
    }
    initOperations();
    return () => {
      active = false;
    };
  }, []);

  const stats = [
    {
      label: "Suppliers",
      value: data.suppliers.length,
      icon: Building2,
      tag: "Verified",
    },
    {
      label: "Products",
      value: data.products.length,
      icon: Package,
      tag: "Active SKUs",
    },
    {
      label: "Warehouses",
      value: data.warehouses.length,
      icon: Warehouse,
      tag: "Global Hubs",
    },
    {
      label: "Inventory Records",
      value: data.inventory.length,
      icon: Boxes,
      tag: "Stock Nodes",
    },
    {
      label: "Shipments",
      value: data.shipments.length,
      icon: Truck,
      tag: "Transit Lines",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center font-mono">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-cyan-400" />
          <p className="mt-4 text-xs text-slate-400">
            Syncing operational database records...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 font-sans">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center pb-4 border-b border-[var(--border-color)]">
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] font-bold tracking-wider text-cyan-400 uppercase mb-1">
            <span>● SUPPLY CHAIN OPERATIONS &amp; ENTERPRISE INVENTORY</span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Operations
          </h1>

          <p className="mt-1 text-xs font-mono text-slate-400">
            Monitor suppliers, products, warehouses, inventory records, and shipments using data from the connected backend.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadOperations(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border-color)] bg-[#162032] px-4 py-2 font-mono text-xs font-medium text-slate-200 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={13}
            className={refreshing ? "animate-spin text-cyan-400" : ""}
          />
          <span>{refreshing ? "Refreshing..." : "Refresh Records"}</span>
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 font-mono text-xs text-rose-300">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-400" />
          <div>
            <p className="font-bold">Unable to load operations data</p>
            <p className="mt-0.5 opacity-90">{error}</p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="stitch-card p-4 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div className="rounded-lg border border-slate-800 bg-[#080d16] p-2 text-cyan-400">
                  <Icon size={16} />
                </div>
                <span className="stitch-pill text-[9px]">
                  {stat.tag}
                </span>
              </div>

              <div className="mt-4">
                <p className="text-2xl font-extrabold text-white font-mono">
                  {stat.value}
                </p>
                <p className="text-xs font-mono text-slate-400 mt-0.5">
                  {stat.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Data sections */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Suppliers */}
        <DataCard
          title="Suppliers"
          icon={Building2}
          data={data.suppliers}
          columns={["name", "location", "contact_email"]}
        />

        {/* Products */}
        <DataCard
          title="Products"
          icon={Package}
          data={data.products}
          columns={["name", "category", "unit_price"]}
        />

        {/* Warehouses */}
        <DataCard
          title="Warehouses"
          icon={Warehouse}
          data={data.warehouses}
          columns={["name", "location", "capacity"]}
        />

        {/* Inventory */}
        <DataCard
          title="Inventory"
          icon={Boxes}
          data={data.inventory}
          columns={[
            "product_id",
            "warehouse_id",
            "quantity",
            "reorder_level",
          ]}
        />
      </div>

      {/* Shipments */}
      <DataCard
        title="Shipments"
        icon={Truck}
        data={data.shipments}
        columns={[
          "id",
          "origin",
          "destination",
          "status",
        ]}
        large
      />

      {/* Integrity notice */}
      <div className="stitch-card p-4 font-mono text-[11px] text-slate-400 flex items-center justify-between">
        <span>
          <strong className="text-slate-300">Data integrity:</strong> This page displays operational records returned by the SupplyChainAI backend.
        </span>
        <span className="text-emerald-400 font-bold">PostgreSQL Verified</span>
      </div>
    </div>
  );
}

function DataCard({
  title,
  icon: Icon,
  data,
  columns,
  large = false,
}) {
  return (
    <section className="stitch-card p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg border border-slate-800 bg-[#080d16] p-1.5 text-cyan-400">
            <Icon size={15} />
          </div>

          <div>
            <h2 className="text-sm font-bold text-white font-mono">
              {title}
            </h2>
          </div>
        </div>

        <span className="stitch-pill text-[10px]">
          {data.length} record{data.length === 1 ? "" : "s"}
        </span>
      </div>

      {data.length === 0 ? (
        <div className="py-8 text-center font-mono text-xs text-slate-500">
          No records currently loaded.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="stitch-table font-mono text-xs">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column}>
                    {formatColumnName(column)}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {data.slice(0, 10).map((row, index) => (
                <tr key={row.id ?? index}>
                  {columns.map((column) => (
                    <td key={column} className="text-slate-300">
                      {formatValue(row[column])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {data.length > 10 && (
            <div className="border-t border-[var(--border-color)] pt-3 text-[10px] font-mono text-slate-500">
              Showing the first 10 records of {data.length}.
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function formatColumnName(value) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatValue(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

export default Operations;