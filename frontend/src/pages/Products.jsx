import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Package,
  Plus,
  Search,
  SlidersHorizontal,
  Anchor,
  AlertCircle,
  Save,
  CheckCircle2,
  Trash2,
  Edit2,
  X,
} from "lucide-react";
import { sampleProducts } from "../data/sampleData";

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState(sampleProducts);
  const [isModalOpen, setIsModalOpen] = useState(searchParams.get("add") === "true");
  const [searchQuery, setSearchQuery] = useState("");

  // New product form state
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [cost, setCost] = useState("");
  const [quantity, setQuantity] = useState("");
  const [weight, setWeight] = useState("");
  const [port, setPort] = useState("Port of Ningbo-Zhoushan (China)");
  const [isFragile, setIsFragile] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

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
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (searchParams.get("add")) {
      searchParams.delete("add");
      setSearchParams(searchParams);
    }
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newProduct = {
      id: Date.now(),
      name: name.trim(),
      sku: sku.trim() || `AC-${Math.floor(100 + Math.random() * 900)}`,
      costPerUnit: parseFloat(cost) || 12.5,
      packingQty: parseInt(quantity, 10) || 500,
      weightPerCarton: parseFloat(weight) || 10.0,
      originPort: port,
      fragile: isFragile,
    };

    setProducts([newProduct, ...products]);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      handleCloseModal();
    }, 600);
  };

  const filteredProducts = products.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.originPort.toLowerCase().includes(q)
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
            <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--surface-overlay)] text-[var(--text-secondary)] border border-[var(--border-color)]">
              Sample data
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
          {filteredProducts.length} items registered
        </div>
      </div>

      {/* Products Table */}
      <div className="cs-card overflow-hidden">
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
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-[var(--text-secondary)]">
                    No products found. Click "Add a New Product" to create your first item.
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
                        ${p.costPerUnit.toFixed(2)}
                      </div>
                      <div className="text-[11px] text-[var(--text-dim)]">per unit</div>
                    </td>
                    <td>
                      <div className="font-semibold text-xs text-[var(--text-high-contrast)]">
                        {p.packingQty}
                      </div>
                      <div className="text-[11px] text-[var(--text-secondary)]">units / pallet</div>
                    </td>
                    <td>
                      <div className="font-semibold text-xs text-[var(--text-high-contrast)]">
                        {p.weightPerCarton} kg
                      </div>
                      <div className="text-[11px] text-[var(--text-dim)]">gross weight</div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5 text-xs text-[var(--text-high-contrast)]">
                        <Anchor size={12} className="text-[var(--accent-cyan)] shrink-0" />
                        <span className="truncate">{p.originPort}</span>
                      </div>
                    </td>
                    <td>
                      {p.fragile ? (
                        <span className="cs-pill cs-pill-amber text-[10px]">
                          Fragile (Shock-safe)
                        </span>
                      ) : (
                        <span className="cs-pill cs-pill-green text-[10px]">
                          Standard Freight
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================
          ADD A NEW PRODUCT MODAL (MATCHES SCREENSHOT 5)
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
                    Enter basic details. We'll remember this next time you plan a shipment.
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
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="AC-CUP-44"
                    className="cs-input text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                    Cost per Unit ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="6.80"
                    className="cs-input text-xs"
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
                  className="cs-btn cs-btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cs-btn cs-btn-primary text-xs flex items-center gap-1.5"
                >
                  <Save size={13} />
                  {savedSuccess ? "Saved!" : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
