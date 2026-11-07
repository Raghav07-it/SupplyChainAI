import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Package,
  Plus,
  Search,
  Anchor,
  AlertCircle,
  Save,
  CheckCircle2,
  Trash2,
  X,
  Loader2,
} from "lucide-react";
import { getProducts, createProduct, deleteProduct } from "../api/products";
import EmptyState from "../components/ui/EmptyState";
import LoadingSpinner from "../components/ui/LoadingSpinner";

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(searchParams.get("add") === "true");
  const [searchQuery, setSearchQuery] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  // New product form state
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [cost, setCost] = useState("");
  const [quantity, setQuantity] = useState("");
  const [weight, setWeight] = useState("");
  const [port, setPort] = useState("Port of Ningbo-Zhoushan (China)");
  const [isFragile, setIsFragile] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  async function loadProductsList() {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data || []);
    } catch (err) {
      console.warn("Failed to load products:", err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProductsList();
  }, []);

  useEffect(() => {
    if (searchParams.get("add") === "true") {
      setIsModalOpen(true);
    }
  }, [searchParams]);

  const handleOpenModal = () => {
    setName("");
    setSku("");
    setCost("");
    setQuantity("");
    setWeight("");
    setPort("Port of Ningbo-Zhoushan (China)");
    setIsFragile(false);
    setModalError("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalError("");
    if (searchParams.get("add")) {
      searchParams.delete("add");
      setSearchParams(searchParams);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setModalError("");
    setModalLoading(true);

    try {
      const payload = {
        name: name.trim(),
        sku: sku.trim() || `SKU-${Date.now().toString().slice(-4)}`,
        unit_cost: parseFloat(cost) || 10.0,
        packing_qty: parseInt(quantity, 10) || 500,
        weight_per_carton: parseFloat(weight) || 10.0,
        default_origin_port: port,
        is_fragile: isFragile,
      };

      await createProduct(payload);
      setSavedSuccess(true);
      await loadProductsList();

      setTimeout(() => {
        setSavedSuccess(false);
        handleCloseModal();
      }, 600);
    } catch (err) {
      setModalError(err.message || "Failed to create product.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteProduct = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.message || "Could not delete product.");
    }
  };

  const filteredProducts = products.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (p.name || "").toLowerCase().includes(q) ||
      (p.sku || "").toLowerCase().includes(q) ||
      (p.default_origin_port || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent-cyan)]">
              CATALOG MANAGEMENT
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-high-contrast)]">
            My Products
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
            Manage your export cargo portfolio, packing quantities, carton weights, and default origin ports.
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={handleOpenModal}
            className="cs-btn cs-btn-primary text-xs"
          >
            <Plus size={14} />
            Add a New Product
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative max-w-md w-full">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by title, SKU, or port…"
            className="cs-input pl-9 text-xs"
          />
        </div>
        <div className="text-xs text-[var(--text-secondary)] whitespace-nowrap">
          {products.length} item{products.length === 1 ? "" : "s"} registered
        </div>
      </div>

      {/* Products Table or Empty State */}
      <div className="cs-card overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <LoadingSpinner message="Loading catalog products…" />
          </div>
        ) : products.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<Package size={24} className="text-[var(--accent-primary-light)]" />}
              message="Your Product Catalog is Empty"
              description="Register your export products with unit costs, carton weights, and origin ports to begin planning shipments."
              actionLabel="Add Your First Product"
              onAction={handleOpenModal}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="cs-table w-full">
              <thead>
                <tr>
                  <th>PRODUCT & SKU</th>
                  <th>UNIT COST</th>
                  <th>STANDARD PACKING</th>
                  <th>CARTON WEIGHT</th>
                  <th>DEFAULT ORIGIN PORT</th>
                  <th>HANDLING</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-[var(--text-secondary)]">
                      No matching products found for "{searchQuery}".
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="font-bold text-xs text-[var(--text-high-contrast)]">
                          {p.name}
                        </div>
                        <div className="text-[11px] text-[var(--text-dim)] font-mono">
                          {p.sku}
                        </div>
                      </td>
                      <td>
                        <div className="font-semibold text-xs text-[var(--text-high-contrast)]">
                          ${typeof p.unit_cost === "number" ? p.unit_cost.toFixed(2) : p.unit_cost}
                        </div>
                        <div className="text-[11px] text-[var(--text-dim)]">per unit</div>
                      </td>
                      <td>
                        <div className="font-semibold text-xs text-[var(--text-high-contrast)]">
                          {p.packing_qty || 500}
                        </div>
                        <div className="text-[11px] text-[var(--text-secondary)]">units / pallet</div>
                      </td>
                      <td>
                        <div className="font-semibold text-xs text-[var(--text-high-contrast)]">
                          {p.weight_per_carton || 10.0} kg
                        </div>
                        <div className="text-[11px] text-[var(--text-dim)]">gross weight</div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5 text-xs text-[var(--text-high-contrast)]">
                          <Anchor size={12} className="text-[var(--accent-cyan)] shrink-0" />
                          <span className="truncate">{p.default_origin_port || "Unspecified Port"}</span>
                        </div>
                      </td>
                      <td>
                        {p.is_fragile ? (
                          <span className="cs-pill cs-pill-amber text-[10px]">
                            Fragile (Shock-safe)
                          </span>
                        ) : (
                          <span className="cs-pill cs-pill-green text-[10px]">
                            Standard Freight
                          </span>
                        )}
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteProduct(p.id, e)}
                          className="p-1.5 rounded text-[var(--text-dim)] hover:text-[var(--status-critical)] hover:bg-[rgba(239,68,68,0.1)] transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =========================================================
          ADD A NEW PRODUCT MODAL
          ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Blurred Backdrop */}
          <div
            className="fixed inset-0 bg-[#0B0F17]/80 backdrop-blur-md transition-opacity"
            onClick={handleCloseModal}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-lg bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-2xl shadow-2xl p-6 sm:p-7 z-10 animate-fade-in space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[var(--border-color)] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary-bg)] border border-[rgba(99,102,241,0.3)] flex items-center justify-center text-[var(--accent-primary-light)]">
                  <Package size={17} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[var(--text-high-contrast)]">
                    Add a New Product
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Enter product specifications. Saved directly to your supplier catalog.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1 rounded-md text-[var(--text-secondary)] hover:text-white hover:bg-[var(--surface-overlay)] transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Error Banner */}
            {modalError && (
              <div className="p-3 rounded-lg bg-[rgba(239,68,68,0.12)] border border-[rgba(239,68,68,0.3)] flex items-center gap-2 text-xs text-[var(--status-critical)]">
                <AlertCircle size={14} className="shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleSaveProduct} className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Porcelain Espresso Cups"
                  className="cs-input text-xs"
                  disabled={modalLoading}
                />
                <span className="text-[11px] text-[var(--text-dim)] mt-1 block">
                  Clear trade label displayed on customs manifests & packing slips.
                </span>
              </div>

              {/* SKU & Cost Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                    SKU / Code
                  </label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="AC-CUP-44"
                    className="cs-input text-xs font-mono"
                    disabled={modalLoading}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                    Cost per Unit ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="6.80"
                    className="cs-input text-xs"
                    disabled={modalLoading}
                  />
                </div>
              </div>

              {/* Packing Qty & Weight Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                    Standard Packing Quantity
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="480"
                      className="cs-input text-xs pr-16"
                      disabled={modalLoading}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[var(--text-dim)] pointer-events-none">
                      units/pallet
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                    Weight per Carton
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="11.2"
                      className="cs-input text-xs pr-10"
                      disabled={modalLoading}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[var(--text-dim)] pointer-events-none">
                      kg
                    </span>
                  </div>
                </div>
              </div>

              {/* Default Origin Port */}
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Default Origin Port
                </label>
                <select
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  className="cs-select text-xs"
                  disabled={modalLoading}
                >
                  <option value="Port of Ningbo-Zhoushan (China)">
                    Port of Ningbo-Zhoushan (China)
                  </option>
                  <option value="Port of Valencia (Spain)">
                    Port of Valencia (Spain)
                  </option>
                  <option value="Port of Qingdao (China)">
                    Port of Qingdao (China)
                  </option>
                  <option value="Port of Marseille (France)">
                    Port of Marseille (France)
                  </option>
                  <option value="Port of Rotterdam (Netherlands)">
                    Port of Rotterdam (Netherlands)
                  </option>
                </select>
              </div>

              {/* Fragile Checkbox */}
              <div className="p-3 rounded-lg bg-[var(--surface-base)] border border-[var(--border-color)]">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFragile}
                    onChange={(e) => setIsFragile(e.target.checked)}
                    disabled={modalLoading}
                    className="mt-0.5 w-4 h-4 rounded border-[var(--border-color)] bg-[var(--surface-base)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)] cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-semibold text-[var(--text-high-contrast)] block">
                      Fragile goods (recommends shock-safe routes)
                    </span>
                    <span className="text-[11px] text-[var(--text-secondary)] block mt-0.5 leading-relaxed">
                      We'll automatically suggest carriers with verified low-vibration transit lanes and tilt sensors.
                    </span>
                  </div>
                </label>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={modalLoading}
                  className="cs-btn cs-btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="cs-btn cs-btn-primary text-xs flex items-center gap-1.5"
                >
                  {modalLoading ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Saving…</span>
                    </>
                  ) : savedSuccess ? (
                    <>
                      <CheckCircle2 size={13} className="text-[var(--status-success)]" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <>
                      <Save size={13} />
                      <span>Save Product</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
