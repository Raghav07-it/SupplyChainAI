import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Ship,
  Package,
  Calendar,
  Clock,
  Shield,
  Star,
  Check,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Pencil,
  SlidersHorizontal,
  RefreshCw,
  Lightbulb,
  Anchor,
  Compass,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { getProducts } from "../api/products";
import { createShipment } from "../api/shipments";
import { sampleRouteOptions } from "../data/sampleData";
import EmptyState from "../components/ui/EmptyState";
import LoadingSpinner from "../components/ui/LoadingSpinner";

export default function PlanShipment({ initialStep }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // If initialStep was passed or query param ?step=X exists
  const startStep = initialStep || (searchParams.get("step") ? parseInt(searchParams.get("step"), 10) : 1);
  const [currentStep, setCurrentStep] = useState(startStep);

  // Products from Backend
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState(null);

  // Form State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [originPort, setOriginPort] = useState("Port of Valencia (Spain)");
  const [destPort, setDestPort] = useState("Port of New York / New Jersey");
  const [readyDate, setReadyDate] = useState("2025-11-12");
  const [priority, setPriority] = useState("balanced"); // 'balanced' | 'lowest' | 'guaranteed'
  const [selectedRouteId, setSelectedRouteId] = useState("safest");
  const [quoteLocked, setQuoteLocked] = useState(false);
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [step2Error, setStep2Error] = useState(null);
  const [createdShipment, setCreatedShipment] = useState(null);

  const selectedRoute = sampleRouteOptions.find((r) => r.id === selectedRouteId) || sampleRouteOptions[2];

  useEffect(() => {
    let isMounted = true;
    getProducts()
      .then((data) => {
        if (!isMounted) return;
        const list = Array.isArray(data) ? data : [];
        setProducts(list);
        if (list.length > 0) {
          setSelectedProduct(list[0]);
          if (list[0].default_origin_port) {
            setOriginPort(list[0].default_origin_port);
          }
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setProductError(err.message || "Failed to load products from catalog.");
      })
      .finally(() => {
        if (isMounted) setLoadingProducts(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectProduct = (prod) => {
    setSelectedProduct(prod);
    if (prod.default_origin_port) {
      setOriginPort(prod.default_origin_port);
    }
  };

  const handleSwapPorts = () => {
    const temp = originPort;
    setOriginPort(destPort);
    setDestPort(temp);
  };

  const handleApplyTip = () => {
    setReadyDate("2025-11-10");
  };

  const handleLockQuote = async () => {
    if (!selectedProduct) return;
    setSubmittingBooking(true);
    setBookingError(null);

    try {
      const costNum = parseFloat(String(selectedRoute.price).replace(/[^0-9.]/g, "")) || 3980;
      const qty = selectedProduct.packing_qty || 500;

      const payload = {
        product_id: selectedProduct.id,
        quantity: qty,
        origin_port: originPort,
        destination_port: destPort,
        carrier: selectedRoute.carrier || "Hapag-Lloyd",
        route_type: selectedRoute.label || "Safest Route",
        cost: costNum,
        status: "in_transit",
        expected_arrival: "2025-12-01",
      };

      const res = await createShipment(payload);
      setCreatedShipment(res);
      setQuoteLocked(true);
    } catch (err) {
      setBookingError(err.message || "Failed to lock quote and book shipment.");
    } finally {
      setSubmittingBooking(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Top Wizard Pill & Estimated Transit */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="cs-pill cs-pill-blue text-[11px] font-bold uppercase">
            SHIPMENT WIZARD • {selectedProduct ? `Cargo: ${selectedProduct.sku}` : "New Draft"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
          <span className="cs-pill cs-pill-cyan text-xs">
            <Clock size={12} />
            ESTIMATED TRANSIT: 14 – 18 Days via Atlantic
          </span>
        </div>
      </div>

      {/* Page Title & Subtitle */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-high-contrast)]">
          {currentStep === 3
            ? "Choose Your Route"
            : currentStep === 4
            ? "Review & Lock Freight Quote"
            : "Plan a New Shipment"}
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
          {currentStep === 3
            ? "Select the ocean transport corridor that balances cost, delivery speed, and operational certainty."
            : currentStep === 4
            ? "Confirm your booking details and lock your guaranteed rate under ChainSight Freight Escrow."
            : "Answer three quick questions to discover the best routes for your cargo."}
        </p>
      </div>

      {/* Stepper Progress Bar */}
      <div className="grid grid-cols-3 gap-2 border-b border-[var(--border-color)] pb-4">
        {/* Step 1 */}
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className={`flex items-center gap-2.5 p-2 rounded-lg text-left transition-colors ${
            currentStep === 1
              ? "bg-[var(--surface-overlay)] text-[var(--text-high-contrast)]"
              : "text-[var(--text-secondary)] hover:text-white"
          }`}
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              currentStep > 1
                ? "bg-[var(--status-success)] text-white"
                : currentStep === 1
                ? "bg-[var(--accent-primary)] text-white"
                : "bg-[var(--surface-overlay)] text-[var(--text-secondary)]"
            }`}
          >
            {currentStep > 1 ? <Check size={14} /> : "1"}
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase font-semibold text-[var(--text-dim)]">Step 1</div>
            <div className="text-xs font-bold truncate">Product & Quantity</div>
          </div>
        </button>

        {/* Step 2 */}
        <button
          type="button"
          onClick={() => {
            if (products.length > 0 && selectedProduct) {
              setCurrentStep(2);
            }
          }}
          disabled={products.length === 0}
          className={`flex items-center gap-2.5 p-2 rounded-lg text-left transition-colors ${
            products.length === 0
              ? "opacity-50 cursor-not-allowed text-[var(--text-dim)]"
              : currentStep === 2
              ? "bg-[var(--surface-overlay)] text-[var(--text-high-contrast)]"
              : "text-[var(--text-secondary)] hover:text-white"
          }`}
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              currentStep > 2
                ? "bg-[var(--status-success)] text-white"
                : currentStep === 2
                ? "bg-[var(--accent-primary)] text-white"
                : "bg-[var(--surface-overlay)] text-[var(--text-secondary)]"
            }`}
          >
            {currentStep > 2 ? <Check size={14} /> : "2"}
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase font-semibold text-[var(--text-dim)]">
              {currentStep === 2 ? "Step 2 • Active" : "Step 2"}
            </div>
            <div className="text-xs font-bold truncate">Origin & Destination</div>
          </div>
        </button>

        {/* Step 3 */}
        <button
          type="button"
          onClick={() => {
            if (products.length > 0 && selectedProduct) {
              setCurrentStep(3);
            }
          }}
          disabled={products.length === 0}
          className={`flex items-center gap-2.5 p-2 rounded-lg text-left transition-colors ${
            products.length === 0
              ? "opacity-50 cursor-not-allowed text-[var(--text-dim)]"
              : currentStep === 3
              ? "bg-[var(--surface-overlay)] text-[var(--text-high-contrast)]"
              : "text-[var(--text-secondary)] hover:text-white"
          }`}
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              currentStep > 3
                ? "bg-[var(--status-success)] text-white"
                : currentStep === 3
                ? "bg-[var(--accent-primary)] text-white"
                : "bg-[var(--surface-overlay)] text-[var(--text-secondary)]"
            }`}
          >
            {currentStep > 3 ? <Check size={14} /> : "3"}
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase font-semibold text-[var(--text-dim)]">Step 3</div>
            <div className="text-xs font-bold truncate">Compare Route Options</div>
          </div>
        </button>
      </div>

      {/* =========================================================
          STEP 1: PRODUCT & QUANTITY
          ========================================================= */}
      {currentStep === 1 && (
        <div className="cs-card p-6 space-y-6 max-w-3xl">
          <div>
            <h2 className="text-lg font-bold text-[var(--text-high-contrast)]">
              Select Cargo From Registered Catalog
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Choose the items you plan to export to automatically apply carton dimensions and fragility ratings.
            </p>
          </div>

          {loadingProducts ? (
            <div className="py-12 flex justify-center">
              <LoadingSpinner message="Loading catalog products..." />
            </div>
          ) : productError ? (
            <div className="p-4 rounded-lg bg-[var(--status-critical-bg)] border border-[var(--status-critical-border)] text-[var(--status-critical)] text-xs flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{productError}</span>
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No Products in Catalog"
              description="You must register at least one product in your company catalog before you can plan and quote a shipment."
              actionLabel="Add Your First Product"
              onAction={() => navigate("/products")}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {products.map((p) => {
                  const isSel = selectedProduct?.id === p.id;
                  const packingQty = p.packing_qty || 500;
                  const weightPerCarton = p.weight_per_carton || 10;
                  const costPerUnit = p.cost_per_unit || 0;
                  const isFragile = Boolean(p.is_fragile);

                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectProduct(p)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        isSel
                          ? "bg-[var(--surface-overlay)] border-[var(--accent-primary)] shadow-[0_0_12px_rgba(99,102,241,0.25)]"
                          : "bg-[var(--surface-base)] border-[var(--border-color)] hover:border-[var(--border-active)]"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-sm font-bold text-[var(--text-high-contrast)]">
                            {p.name}
                          </div>
                          <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                            SKU: {p.sku} • {packingQty} units/pallet
                          </div>
                        </div>
                        {isSel && <CheckCircle2 size={16} className="text-[var(--accent-primary-light)]" />}
                      </div>
                      <div className="flex items-center gap-2 mt-3 text-[11px] text-[var(--text-dim)]">
                        <span>${Number(costPerUnit).toFixed(2)}/unit</span>
                        <span>•</span>
                        <span>{weightPerCarton} kg/carton</span>
                        {isFragile && (
                          <span className="cs-pill cs-pill-amber text-[10px] py-0 px-1.5 ml-auto">
                            Fragile
                          </span>
                        )}
                      </div>
                      {p.default_origin_port && (
                        <div className="mt-2 text-[10px] text-[var(--text-dim)] truncate">
                          Origin: {p.default_origin_port}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-[var(--border-color)] flex justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  disabled={!selectedProduct}
                  className="cs-btn cs-btn-primary text-xs"
                >
                  Continue to Origin & Destination →
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* =========================================================
          STEP 2: ORIGIN & DESTINATION
          ========================================================= */}
      {currentStep === 2 && selectedProduct && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Left Column (8 cols) */}
          <div className="lg:col-span-8 space-y-5">
            {/* Step 1 Summary Card */}
            <div className="cs-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-[var(--surface-base)] border border-[var(--border-color)] flex items-center justify-center shrink-0">
                  <Package size={22} className="text-[var(--accent-cyan)]" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-dim)]">
                    STEP 1 SUMMARY • Selected Cargo
                  </div>
                  <div className="text-sm font-bold text-[var(--text-high-contrast)] flex items-center gap-2 mt-0.5">
                    {selectedProduct.name}
                    <span className="text-xs font-normal text-[var(--text-secondary)]">
                      SKU: {selectedProduct.sku}
                    </span>
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {selectedProduct.packing_qty || 500} boxes (Total weight: {((selectedProduct.packing_qty || 500) * (selectedProduct.weight_per_carton || 10)).toLocaleString()} kg / ~1 standard 20ft container)
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`cs-pill text-[10px] py-0.5 ${selectedProduct.is_fragile ? "cs-pill-amber" : "cs-pill-green"}`}>
                      {selectedProduct.is_fragile ? "⚠ Fragile Handling Required" : "✓ Standard Cargo Profile"}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-xs font-semibold text-[var(--accent-cyan)] hover:underline flex items-center gap-1 shrink-0"
              >
                <Pencil size={12} />
                Change product
              </button>
            </div>

            {/* Step 2 Form Card */}
            <div className="cs-card p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-primary-light)]">
                    STEP 2 OF 3
                  </span>
                  <h2 className="text-lg font-bold text-[var(--text-high-contrast)] mt-0.5">
                    Where is this cargo heading?
                  </h2>
                </div>
                <span className="cs-pill cs-pill-cyan text-xs font-semibold">
                  FCL Shipment
                </span>
              </div>

              {/* Origin & Destination with Swap */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                    Origin Port <span className="text-[var(--text-dim)]">(Departing)</span>
                  </label>
                  <div className="relative">
                    <Anchor size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
                    <input
                      type="text"
                      value={originPort}
                      onChange={(e) => setOriginPort(e.target.value)}
                      className="cs-input pl-9"
                    />
                  </div>
                  <span className="text-[11px] text-[var(--text-dim)] mt-1 block">
                    Default port for {selectedProduct.name}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                    Destination Port / City <span className="text-[var(--text-dim)]">(Discharge)</span>
                  </label>
                  <div className="relative">
                    <Compass size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
                    <input
                      type="text"
                      value={destPort}
                      onChange={(e) => setDestPort(e.target.value)}
                      className="cs-input pl-9"
                    />
                  </div>
                  <span className="text-[11px] text-[var(--text-dim)] mt-1 block">
                    Discharge Container Terminal
                  </span>
                </div>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center -my-2">
                <button
                  type="button"
                  onClick={handleSwapPorts}
                  className="px-3 py-1 rounded bg-[var(--surface-base)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)] hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw size={12} />
                  Swap Direction
                </button>
              </div>

              {/* Cargo Ready Date */}
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Cargo Ready Date
                </label>
                <div className="relative max-w-sm">
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
                  <input
                    type="date"
                    value={readyDate}
                    onChange={(e) => setReadyDate(e.target.value)}
                    className="cs-input pl-9"
                  />
                </div>
                <span className="text-[11px] text-[var(--text-dim)] mt-1 block">
                  When your factory finishes packing and export crates are palletized.
                </span>
              </div>

              {/* Shipment Priority Choice */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-[var(--text-high-contrast)]">
                    Select your shipment priority
                  </label>
                  <span className="text-[11px] text-[var(--text-dim)]">
                    Tailors our automated route ranking
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Balanced Choice */}
                  <div
                    onClick={() => setPriority("balanced")}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      priority === "balanced"
                        ? "bg-[var(--surface-overlay)] border-[var(--accent-primary)] shadow-[0_0_12px_rgba(99,102,241,0.25)]"
                        : "bg-[var(--surface-base)] border-[var(--border-color)] hover:border-[var(--border-active)]"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-7 h-7 rounded-md bg-[var(--accent-primary-bg)] flex items-center justify-center text-[var(--accent-primary-light)]">
                        <SlidersHorizontal size={14} />
                      </div>
                      {priority === "balanced" && (
                        <CheckCircle2 size={16} className="text-[var(--accent-primary-light)]" />
                      )}
                    </div>
                    <div className="text-sm font-bold text-[var(--text-high-contrast)] mt-2">
                      Balanced Choice
                    </div>
                    <span className="cs-pill cs-pill-blue text-[9px] py-0 px-1 mt-0.5">
                      Recommended
                    </span>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-2 leading-tight">
                      Balances optimal ocean freight rates with steady 16-day schedule.
                    </p>
                  </div>

                  {/* Lowest Price */}
                  <div
                    onClick={() => setPriority("lowest")}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      priority === "lowest"
                        ? "bg-[var(--surface-overlay)] border-[var(--accent-primary)] shadow-[0_0_12px_rgba(99,102,241,0.25)]"
                        : "bg-[var(--surface-base)] border-[var(--border-color)] hover:border-[var(--border-active)]"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-7 h-7 rounded-md bg-[var(--status-success-bg)] flex items-center justify-center text-[var(--status-success)]">
                        <DollarSign size={14} />
                      </div>
                      {priority === "lowest" && (
                        <CheckCircle2 size={16} className="text-[var(--accent-primary-light)]" />
                      )}
                    </div>
                    <div className="text-sm font-bold text-[var(--text-high-contrast)] mt-2">
                      Lowest Price
                    </div>
                    <span className="cs-pill cs-pill-green text-[9px] py-0 px-1 mt-0.5">
                      Max Economy
                    </span>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-2 leading-tight">
                      Prioritizes slow-steaming routes with deep container carrier discounts.
                    </p>
                  </div>

                  {/* Guaranteed Date */}
                  <div
                    onClick={() => setPriority("guaranteed")}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      priority === "guaranteed"
                        ? "bg-[var(--surface-overlay)] border-[var(--accent-primary)] shadow-[0_0_12px_rgba(99,102,241,0.25)]"
                        : "bg-[var(--surface-base)] border-[var(--border-color)] hover:border-[var(--border-active)]"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-7 h-7 rounded-md bg-[var(--accent-cyan-bg)] flex items-center justify-center text-[var(--accent-cyan)]">
                        <Clock size={14} />
                      </div>
                      {priority === "guaranteed" && (
                        <CheckCircle2 size={16} className="text-[var(--accent-primary-light)]" />
                      )}
                    </div>
                    <div className="text-sm font-bold text-[var(--text-high-contrast)] mt-2">
                      Guaranteed Date
                    </div>
                    <span className="cs-pill cs-pill-cyan text-[9px] py-0 px-1 mt-0.5">
                      Direct Sailings
                    </span>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-2 leading-tight">
                      Direct transits avoiding transshipment hubs with expedited port slots.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 Error Banner */}
              {step2Error && (
                <div className="p-3 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-xs text-[var(--status-critical)] flex items-center gap-2">
                  <AlertCircle size={15} />
                  <span>{step2Error}</span>
                </div>
              )}

              {/* Bottom Nav Buttons */}
              <div className="pt-4 border-t border-[var(--border-color)] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setStep2Error(null);
                    setCurrentStep(1);
                  }}
                  className="cs-btn cs-btn-secondary text-xs"
                >
                  <ArrowLeft size={14} />
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!originPort.trim() || !destPort.trim()) {
                      setStep2Error("Both Origin and Destination ports are required.");
                      return;
                    }
                    if (originPort.trim().toLowerCase() === destPort.trim().toLowerCase()) {
                      setStep2Error("Origin and Destination ports cannot be identical.");
                      return;
                    }
                    if (!readyDate) {
                      setStep2Error("Please select a cargo ready date.");
                      return;
                    }
                    setStep2Error(null);
                    setCurrentStep(3);
                  }}
                  className="cs-btn cs-btn-primary text-xs"
                >
                  Compare 3 Available Routes
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Widgets (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Widget 1: Pro Supplier Tip */}
            <div className="cs-card p-5 space-y-3 bg-gradient-to-br from-[var(--surface-elevated)] to-[#1b2333]">
              <div className="flex items-center gap-2 text-[var(--status-warning)]">
                <Lightbulb size={16} />
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  PRO SUPPLIER TIP
                </span>
              </div>
              <h3 className="text-sm font-bold text-[var(--text-high-contrast)]">
                Avoid Weekend Customs Queues
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Did you know? Shipping <strong>2 days earlier</strong> from {originPort.split("(")[0].trim() || "origin"} (Nov 10 instead of Nov 12) connects directly with Tuesday feeder sailings, shaving 48 hours off customs clearance.
              </p>
              <div className="pt-2 border-t border-[var(--border-color)] flex items-center justify-between">
                <span className="cs-pill cs-pill-green text-[10px]">
                  ~ Saves approx. $340
                </span>
                <button
                  type="button"
                  onClick={handleApplyTip}
                  className="text-xs font-semibold text-[var(--accent-cyan)] hover:underline"
                >
                  Apply Nov 10
                </button>
              </div>
            </div>

            {/* Widget 2: Corridor Health Status */}
            <div className="cs-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                  <Compass size={14} className="text-[var(--accent-cyan)]" />
                  Corridor Health Status
                </h3>
              </div>

              {/* Route banner */}
              <div className="h-24 rounded-lg bg-[var(--surface-base)] border border-[var(--border-color)] p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--text-high-contrast)]">
                    {originPort.split("(")[0].trim()} → {destPort.split("/")[0].trim()}
                  </span>
                  <span className="cs-pill cs-pill-green text-[10px] py-0 px-1.5">
                    Normal Flow
                  </span>
                </div>
                <div className="text-[11px] text-[var(--text-dim)]">
                  Maritime Trade Corridor • Normal Transit Flow
                </div>
              </div>

              <div className="space-y-2 text-xs pt-1">
                <div className="flex justify-between py-1 border-b border-[var(--border-color)]">
                  <span className="text-[var(--text-secondary)]">Congestion Index</span>
                  <span className="font-semibold text-[var(--status-success)]">Low (1.2 days wait)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[var(--border-color)]">
                  <span className="text-[var(--text-secondary)]">Average Fuel Index</span>
                  <span className="font-semibold text-[var(--text-high-contrast)]">Stable (BAF-04)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[var(--text-secondary)]">CO₂ Footprint / TEU</span>
                  <span className="font-semibold text-[var(--text-high-contrast)]">~1.14 tons</span>
                </div>
              </div>
            </div>

            {/* Concierge Widget */}
            <div className="cs-card p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--accent-primary-bg)] flex items-center justify-center text-[var(--accent-primary-light)] shrink-0">
                <Ship size={15} />
              </div>
              <div className="text-xs">
                <div className="font-semibold text-[var(--text-high-contrast)]">Customs Concierge</div>
                <div className="text-[11px] text-[var(--text-secondary)]">Chat directly with a specialist</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          STEP 3: COMPARE ROUTE OPTIONS
          ========================================================= */}
      {currentStep === 3 && selectedProduct && (
        <div className="space-y-6">
          {/* Freight Escrow Trust Banner */}
          <div className="flex items-center gap-2">
            <span className="cs-pill cs-pill-green text-xs font-semibold">
              ✓ All quotes backed by ChainSight Freight Escrow
            </span>
          </div>

          {/* Shipment Summary Bar */}
          <div className="cs-card p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[var(--accent-primary-bg)] border border-[rgba(99,102,241,0.3)] flex items-center justify-center text-[var(--accent-primary-light)] shrink-0">
                <Package size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[var(--text-high-contrast)]">
                    {originPort.split("(")[0].trim()} → {destPort.split("/")[0].trim()}
                  </span>
                  <span className="text-xs text-[var(--text-dim)]">FCL 20ft Standard</span>
                </div>
                <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Shipping {selectedProduct.packing_qty || 500} boxes of {selectedProduct.name} • Est. weight {((selectedProduct.packing_qty || 500) * (selectedProduct.weight_per_carton || 10)).toLocaleString()} kg • Cargo ready {readyDate}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="cs-btn cs-btn-secondary text-xs py-1.5 px-3 shrink-0"
            >
              <Pencil size={13} />
              Edit Cargo Spec
            </button>
          </div>

          {/* 3 Comparison Cards: Cheapest, Fastest, Safest */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sampleRouteOptions.map((opt) => {
              const isSelected = selectedRouteId === opt.id;
              const isSafest = opt.id === "safest";
              const isCheapest = opt.id === "cheapest";

              const badgeText = isCheapest
                ? "Cheapest Option — Save $840"
                : opt.id === "fastest"
                ? "Fastest Option — 12 Days Quicker"
                : "Safest & Most Reliable — Zero Delays";

              const typeBadge = isCheapest ? "ECONOMY" : opt.id === "fastest" ? "EXPRESS" : "TOP CHOICE";

              return (
                <div
                  key={opt.id}
                  onClick={() => setSelectedRouteId(opt.id)}
                  className={`cs-card p-5 flex flex-col justify-between cursor-pointer transition-all relative ${
                    isSafest
                      ? "border-[var(--accent-primary)] shadow-[0_0_24px_rgba(99,102,241,0.25)] ring-1 ring-[var(--accent-primary)]"
                      : isSelected
                      ? "border-[var(--accent-cyan)] shadow-[0_0_16px_rgba(6,182,212,0.2)]"
                      : "hover:border-[var(--border-active)]"
                  }`}
                >
                  {/* Top Recommended Tag on Safest */}
                  {isSafest && (
                    <div className="absolute -top-3 right-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-[var(--accent-primary)] text-white text-[10px] font-bold shadow-md flex items-center gap-1">
                        <Star size={11} className="fill-white" />
                        Recommended
                      </span>
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Header Pills */}
                    <div className="flex items-center justify-between text-[11px] gap-2">
                      <span
                        className={`font-semibold truncate ${
                          isCheapest
                            ? "text-[var(--status-success)]"
                            : opt.id === "fastest"
                            ? "text-[var(--accent-cyan)]"
                            : "text-[var(--accent-primary-light)]"
                        }`}
                      >
                        {badgeText}
                      </span>
                      <span className="text-[10px] font-bold text-[var(--text-dim)] uppercase shrink-0">
                        {typeBadge}
                      </span>
                    </div>

                    {/* Big Price */}
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-bold text-[var(--text-high-contrast)]">
                          {opt.price}
                        </span>
                        <span className="text-xs text-[var(--text-dim)]">total USD</span>
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                        {isCheapest
                          ? "Includes standard wharfage & fuel adjustment"
                          : opt.id === "fastest"
                          ? "Includes priority offloading berth slot"
                          : "Includes full all-risk cargo guarantee"}
                      </p>
                    </div>

                    {/* Transit Days & Voyage Specs */}
                    <div className="p-3 rounded-lg bg-[var(--surface-base)] border border-[var(--border-color)] grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="font-bold text-sm text-[var(--text-high-contrast)] flex items-center gap-1">
                          <Clock size={13} className="text-[var(--text-secondary)]" />
                          {opt.transitDays} days
                        </div>
                        <div className="text-[11px] text-[var(--text-dim)]">
                          {opt.arrivalType}: {opt.arrivalDate}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-xs text-[var(--text-high-contrast)]">
                          {opt.voyageType}
                        </div>
                        <div className="text-[11px] text-[var(--text-dim)]">
                          {opt.vesselType}
                        </div>
                      </div>
                    </div>

                    {/* Risk Indicator Pill */}
                    <div>
                      <span
                        className={`cs-pill text-[11px] w-full justify-center ${
                          opt.riskColor === "green"
                            ? "cs-pill-green"
                            : "cs-pill-amber"
                        }`}
                      >
                        {opt.riskLevel} {opt.riskDetail}
                      </span>
                    </div>

                    {/* Visual Route Corridor */}
                    <div className="py-2 border-y border-[var(--border-color)] text-[11px] text-[var(--text-secondary)] text-center">
                      <div className="font-semibold text-[var(--text-high-contrast)]">
                        {opt.carrierRoute}
                      </div>
                    </div>

                    {/* Cost Breakdown */}
                    <div className="space-y-1.5 text-xs pt-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-dim)]">
                        Cost Breakdown
                      </div>
                      {opt.costBreakdown.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-[11px]">
                          <span className="text-[var(--text-secondary)]">{item.label}</span>
                          <span className="font-semibold text-[var(--text-high-contrast)]">
                            {item.amount}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Carrier Narrative */}
                    <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed italic border-t border-[var(--border-color)] pt-3">
                      {opt.carrierDescription}
                    </p>
                  </div>

                  {/* Card Select Button */}
                  <div className="pt-4 mt-4 border-t border-[var(--border-color)]">
                    <button
                      type="button"
                      className={`w-full cs-btn text-xs ${
                        isSelected || isSafest
                          ? "cs-btn-primary"
                          : "cs-btn-secondary"
                      }`}
                    >
                      {isSelected ? "Choose this route ✓" : "Choose this route →"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sticky Bottom Bar */}
          <div className="sticky bottom-4 z-20 cs-card p-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[var(--surface-elevated)]/95 backdrop-blur-md border border-[var(--border-active)] shadow-2xl">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="cs-btn cs-btn-secondary text-xs"
            >
              <ArrowLeft size={14} />
              Back: Packaging & Pallets
            </button>

            <div className="text-xs text-center sm:text-left">
              <span className="text-[var(--text-dim)]">Selected: </span>
              <span className="font-bold text-[var(--text-high-contrast)]">
                {selectedRoute.label} ({selectedRoute.price})
              </span>
            </div>

            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="cs-btn cs-btn-primary text-xs"
            >
              Continue to Review & Lock Quote
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          STEP 4: REVIEW & LOCK FREIGHT QUOTE
          ========================================================= */}
      {currentStep === 4 && selectedProduct && (
        <div className="cs-card p-6 space-y-6 max-w-2xl mx-auto">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-[var(--accent-primary-bg)] text-[var(--accent-primary-light)] flex items-center justify-center mx-auto">
              <Shield size={24} />
            </div>
            <h2 className="text-xl font-bold text-[var(--text-high-contrast)]">
              {quoteLocked ? "Quote Successfully Locked!" : "Review & Lock Freight Escrow"}
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              {quoteLocked
                ? `Your booking request #${createdShipment?.tracking_number || "CS-CONFIRMED"} has been successfully created and linked to your account.`
                : "Your selected rate is protected for 48 hours without demurrage liability."}
            </p>
          </div>

          {bookingError && (
            <div className="p-3 rounded-lg bg-[var(--status-critical-bg)] border border-[var(--status-critical-border)] text-[var(--status-critical)] text-xs flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{bookingError}</span>
            </div>
          )}

          <div className="p-4 rounded-lg bg-[var(--surface-base)] border border-[var(--border-color)] space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-[var(--border-color)]">
              <span className="text-[var(--text-secondary)]">Product</span>
              <span className="font-bold text-[var(--text-high-contrast)]">
                {selectedProduct.name} ({selectedProduct.packing_qty || 500} units)
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--border-color)]">
              <span className="text-[var(--text-secondary)]">Selected Corridor</span>
              <span className="font-bold text-[var(--text-high-contrast)]">
                {originPort} → {destPort}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--border-color)]">
              <span className="text-[var(--text-secondary)]">Selected Plan</span>
              <span className="font-bold text-[var(--accent-primary-light)]">
                {selectedRoute.label}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--border-color)]">
              <span className="text-[var(--text-secondary)]">Estimated Transit</span>
              <span className="font-bold text-[var(--text-high-contrast)]">
                {selectedRoute.transitDays} Days ({selectedRoute.arrivalDate})
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--border-color)]">
              <span className="text-[var(--text-secondary)]">Total Escrow Quote</span>
              <span className="text-base font-bold text-[var(--text-high-contrast)]">
                {selectedRoute.price} USD
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[var(--text-secondary)]">Cargo Ready Date</span>
              <span className="font-semibold text-[var(--text-high-contrast)]">{readyDate}</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              disabled={submittingBooking || quoteLocked}
              className="cs-btn cs-btn-secondary text-xs w-full sm:w-auto"
            >
              <ArrowLeft size={14} />
              Back to Options
            </button>
            {quoteLocked ? (
              <Link
                to="/my-shipments"
                className="cs-btn cs-btn-primary text-xs w-full sm:w-auto text-center"
              >
                Go to My Shipments →
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleLockQuote}
                disabled={submittingBooking}
                className="cs-btn cs-btn-primary text-xs w-full sm:w-auto"
              >
                {submittingBooking ? (
                  <span className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    Submitting Booking...
                  </span>
                ) : (
                  "Lock Quote & Submit Booking ✓"
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
