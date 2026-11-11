import { useState } from "react";
import { Package, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { createProduct } from "../../api/products";

export default function AddProductModal({ isOpen, onClose, onSuccess }) {
  const [name, setName] = useState("Porcelain Espresso Cups");
  const [sku, setSku] = useState("AC-CUP-44");
  const [cost, setCost] = useState("6.80");
  const [quantity, setQuantity] = useState("480");
  const [weight, setWeight] = useState("11.2");
  const [port, setPort] = useState("Port of Ningbo-Zhoushan (China)");
  const [isFragile, setIsFragile] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setError("");
    setLoading(true);

    try {
      const payload = {
        name: name.trim(),
        sku: sku.trim() || `SKU-${Date.now().toString().slice(-4)}`,
        unit_cost: parseFloat(cost) || 6.8,
        packing_qty: parseInt(quantity, 10) || 480,
        weight_per_carton: parseFloat(weight) || 11.2,
        default_origin_port: port,
        is_fragile: isFragile,
      };

      const created = await createProduct(payload);
      setSuccess(true);
      if (onSuccess) onSuccess(created);

      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 700);
    } catch (err) {
      setError(err.message || "Failed to create product in catalog.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Darkened Backdrop */}
      <div
        className="fixed inset-0 bg-[#070A10]/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-[#141C2E] border border-[#273549] rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.85)] p-6 sm:p-7 z-10 animate-fade-in space-y-5">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-[#273549] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[rgba(99,102,241,0.15)] border border-[rgba(99,102,241,0.3)] flex items-center justify-center text-[var(--accent-primary-light)]">
              <Package size={17} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#F8FAFC]">
                Add a New Product
              </h2>
              <p className="text-sm text-[#94A3B8] mt-1">
                Enter basic details. We'll remember this next time you plan a shipment.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-[#94A3B8] hover:text-white hover:bg-[#1E293B] transition-colors"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-3 rounded-lg bg-[rgba(239,68,68,0.12)] border border-[rgba(239,68,68,0.3)] flex items-center gap-2 text-xs text-[#EF4444]">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-semibold text-[#E2E8F0] mb-1.5">
              Product Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Porcelain Espresso Cups"
              className="cs-input text-base"
              disabled={loading}
            />
            <span className="text-xs text-[#94A3B8] mt-1 block">
              Clear trade label displayed on customs manifests &amp; packing slips.
            </span>
          </div>

          {/* SKU / Code & Cost per Unit ($) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-[#E2E8F0] mb-1.5">
                SKU / Code
              </label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="AC-CUP-44"
                className="cs-input text-base font-mono"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#E2E8F0] mb-1.5">
                Cost per Unit ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#94A3B8] pointer-events-none">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="6.80"
                  className="cs-input text-base pl-7"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Standard Packing Quantity & Weight per Carton */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-[#E2E8F0] mb-1.5">
                Standard Packing Quantity
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="480"
                  className="cs-input text-base pr-20"
                  disabled={loading}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#94A3B8] pointer-events-none">
                  units/pallet
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#E2E8F0] mb-1.5">
                Weight per Carton
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="11.2"
                  className="cs-input text-base pr-10"
                  disabled={loading}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#94A3B8] pointer-events-none">
                  kg
                </span>
              </div>
            </div>
          </div>

          {/* Default Origin Port */}
          <div>
            <label className="block text-sm font-semibold text-[#E2E8F0] mb-1.5">
              Default Origin Port
            </label>
            <select
              value={port}
              onChange={(e) => setPort(e.target.value)}
              className="cs-select text-base"
              disabled={loading}
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
              <option value="Port of Singapore (Singapore)">
                Port of Singapore (Singapore)
              </option>
            </select>
          </div>

          {/* Fragile Goods Checkbox */}
          <div className="p-3.5 rounded-xl bg-[#0E1626] border border-[#273549]">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isFragile}
                onChange={(e) => setIsFragile(e.target.checked)}
                disabled={loading}
                className="mt-1 w-4 h-4 rounded border-[#273549] bg-[#111827] text-[#6366F1] focus:ring-[#6366F1] cursor-pointer"
              />
              <div>
                <span className="text-xs font-semibold text-[#F8FAFC] block">
                  Fragile goods (recommends shock-safe routes)
                </span>
                <span className="text-xs text-[#94A3B8] block mt-0.5 leading-relaxed">
                  We'll automatically suggest carriers with verified low-vibration transit lanes and tilt telemetry sensors.
                </span>
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#273549]">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="cs-btn cs-btn-secondary text-xs sm:text-sm px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="cs-btn cs-btn-primary text-xs sm:text-sm px-5 py-2 font-semibold flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Saving…</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle2 size={14} className="text-[#10B981]" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Product</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

