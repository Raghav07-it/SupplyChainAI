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
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { getProducts } from "../api/products";
import { createShipment } from "../api/shipments";
import { sampleRouteOptions } from "../data/sampleData";
import EmptyState from "../components/ui/EmptyState";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import AddProductModal from "../components/products/AddProductModal";

export default function PlanShipment({ initialStep }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const startStep =
    initialStep || (searchParams.get("step") ? parseInt(searchParams.get("step"), 10) : 2);
  const [currentStep, setCurrentStep] = useState(startStep);

  // Products from Backend
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  // Form State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [customQuantity, setCustomQuantity] = useState("800");
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

  const selectedRoute =
    sampleRouteOptions.find((r) => r.id === selectedRouteId) || sampleRouteOptions[2];

  useEffect(() => {
    let isMounted = true;
    getProducts()
      .then((data) => {
        if (!isMounted) return;
        const list = Array.isArray(data) ? data : [];
        setProducts(list);
        if (list.length > 0) {
          const first = list[0];
          setSelectedProduct(first);
          if (first.packing_qty) setCustomQuantity(String(first.packing_qty));
          if (first.default_origin_port) setOriginPort(first.default_origin_port);
        } else {
          // Provide default product specification matching Image 2
          setSelectedProduct({
            id: 1,
            name: "Glazed Ceramic Dinner Set",
            sku: "AC-SET-08",
            packing_qty: 800,
            weight_per_carton: 24.0,
            cost_per_unit: 14.5,
            is_fragile: true,
            default_origin_port: "Port of Valencia (Spain)",
          });
          setCustomQuantity("800");
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setProductError(err.message || "Failed to load products from catalog.");
        // Fallback default
        setSelectedProduct({
          id: 1,
          name: "Glazed Ceramic Dinner Set",
          sku: "AC-SET-08",
          packing_qty: 800,
          weight_per_carton: 24.0,
          cost_per_unit: 14.5,
          is_fragile: true,
          default_origin_port: "Port of Valencia (Spain)",
        });
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
    if (prod.packing_qty) setCustomQuantity(String(prod.packing_qty));
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

  const parsedQty = parseInt(customQuantity, 10) || selectedProduct?.packing_qty || 800;
  const cartonWeight = selectedProduct?.weight_per_carton || 24;
  const totalWeightKg = (parsedQty * cartonWeight).toLocaleString();

  const handleLockQuote = async () => {
    if (!selectedProduct) return;
    setSubmittingBooking(true);
    setBookingError(null);

    try {
      const costNum =
        parseFloat(String(selectedRoute.price).replace(/[^0-9.]/g, "")) || 3980;

      const payload = {
        product_id: selectedProduct.id,
        quantity: parsedQty,
        origin_port: originPort,
        destination_port: destPort,
        carrier: selectedRoute.carrier || "Maersk Line",
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
      {/* =========================================================
          TOP WIZARD PILL & TRANSIT ESTIMATE (IMAGE 2 MATCH)
          ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="cs-pill cs-pill-blue text-xs font-bold uppercase tracking-wider">
            SHIPMENT WIZARD • Draft #SHP-8821
          </span>
        </div>
        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
          <span className="cs-pill cs-pill-cyan text-xs font-semibold">
            <Clock size={13} />
            ESTIMATED TRANSIT: 14 – 18 Days via Atlantic
          </span>
        </div>
      </div>

      {/* Page Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[var(--text-high-contrast)]">
          {currentStep === 3
            ? "Compare Route Options"
            : currentStep === 4
            ? "Review & Lock Freight Quote"
            : "Plan a New Shipment"}
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1.5 max-w-2xl leading-relaxed">
          {currentStep === 3
            ? "Select the ocean transport corridor that balances cost, delivery speed, and operational certainty."
            : currentStep === 4
            ? "Confirm your booking details and lock your guaranteed rate under ChainSight Freight Escrow."
            : "Answer three quick questions to discover the best routes for your cargo."}
        </p>
      </div>

      {/* =========================================================
          STEPPER PROGRESS BAR (IMAGE 2 MATCH)
          ========================================================= */}
      <div className="grid grid-cols-3 gap-2 border-b border-[var(--border-color)] pb-4">
        {/* Step 1 */}
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className={`flex items-center gap-3 p-2.5 rounded-xl text-left transition-colors ${
            currentStep === 1
              ? "bg-[var(--surface-overlay)] text-[var(--text-high-contrast)]"
              : "text-[var(--text-secondary)] hover:text-white"
          }`}
        >
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
              currentStep > 1
                ? "bg-[var(--status-success)] text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                : "bg-[var(--accent-primary)] text-white"
            }`}
          >
            {currentStep > 1 ? <Check size={16} /> : "1"}
          </div>
          <div className="min-w-0">
            <div className="text-[11px] uppercase font-semibold text-[var(--text-dim)]">Step 1</div>
            <div className="text-xs sm:text-sm font-bold truncate">Product &amp; Quantity</div>
          </div>
        </button>

        {/* Step 2 */}
        <button
          type="button"
          onClick={() => {
            if (selectedProduct) setCurrentStep(2);
          }}
          className={`flex items-center gap-3 p-2.5 rounded-xl text-left transition-colors ${
            currentStep === 2
              ? "bg-[var(--surface-overlay)] text-[var(--text-high-contrast)]"
              : "text-[var(--text-secondary)] hover:text-white"
          }`}
        >
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
              currentStep > 2
                ? "bg-[var(--status-success)] text-white"
                : currentStep === 2
                ? "bg-[var(--accent-primary)] text-white shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                : "bg-[var(--surface-overlay)] text-[var(--text-secondary)]"
            }`}
          >
            {currentStep > 2 ? <Check size={16} /> : "2"}
          </div>
          <div className="min-w-0">
            <div className="text-[11px] uppercase font-semibold text-[var(--text-dim)]">
              {currentStep === 2 ? "Step 2 • Active" : "Step 2"}
            </div>
            <div className="text-xs sm:text-sm font-bold truncate">Origin &amp; Destination</div>
          </div>
        </button>

        {/* Step 3 */}
        <button
          type="button"
          onClick={() => {
            if (selectedProduct) setCurrentStep(3);
          }}
          className={`flex items-center gap-3 p-2.5 rounded-xl text-left transition-colors ${
            currentStep === 3
              ? "bg-[var(--surface-overlay)] text-[var(--text-high-contrast)]"
              : "text-[var(--text-secondary)] hover:text-white"
          }`}
        >
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
              currentStep > 3
                ? "bg-[var(--status-success)] text-white"
                : currentStep === 3
                ? "bg-[var(--accent-primary)] text-white"
                : "bg-[var(--surface-overlay)] text-[var(--text-secondary)]"
            }`}
          >
            {currentStep > 3 ? <Check size={16} /> : "3"}
          </div>
          <div className="min-w-0">
            <div className="text-[11px] uppercase font-semibold text-[var(--text-dim)]">Step 3</div>
            <div className="text-xs sm:text-sm font-bold truncate">Compare Route Options</div>
          </div>
        </button>
      </div>

      {/* =========================================================
          STEP 1: PRODUCT & QUANTITY
          ========================================================= */}
      {currentStep === 1 && (
        <div className="cs-card p-6 sm:p-7 space-y-6 max-w-3xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[var(--text-high-contrast)]">
                Select Cargo &amp; Specify Quantity
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
                Choose the export item and specify the total units or crates for this consignment.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddProductOpen(true)}
              className="cs-btn cs-btn-secondary text-xs"
            >
              + Add New Catalog Item
            </button>
          </div>

          {/* Quantity Input Field */}
          <div className="p-4 rounded-xl bg-[var(--surface-base)] border border-[var(--border-color)] space-y-2">
            <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Consignment Quantity (Boxes / Units)
            </label>
            <div className="flex items-center gap-3 max-w-xs">
              <input
                type="number"
                min="1"
                value={customQuantity}
                onChange={(e) => setCustomQuantity(e.target.value)}
                placeholder="800"
                className="cs-input text-sm font-bold"
              />
              <span className="text-xs text-[var(--text-dim)] whitespace-nowrap">
                crates / boxes
              </span>
            </div>
          </div>

          {loadingProducts ? (
            <div className="py-12 flex justify-center">
              <LoadingSpinner message="Loading catalog products…" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {products.map((p) => {
                  const isSel = selectedProduct?.id === p.id;
                  const packingQty = p.packing_qty || 480;
                  const weightPerCarton = p.weight_per_carton || 11.2;
                  const costPerUnit = p.cost_per_unit || p.unit_cost || 6.8;
                  const isFragile = Boolean(p.is_fragile);

                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectProduct(p)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSel
                          ? "bg-[var(--surface-overlay)] border-[var(--accent-primary)] shadow-[0_0_16px_rgba(99,102,241,0.3)]"
                          : "bg-[var(--surface-base)] border-[var(--border-color)] hover:border-[var(--border-active)]"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-sm font-bold text-[var(--text-high-contrast)]">
                            {p.name}
                          </div>
                          <div className="text-xs text-[var(--text-secondary)] font-mono mt-0.5">
                            SKU: {p.sku} • {packingQty} units/pallet
                          </div>
                        </div>
                        {isSel && (
                          <CheckCircle2 size={18} className="text-[var(--accent-primary-light)] shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-3 text-xs text-[var(--text-dim)]">
                        <span>${Number(costPerUnit).toFixed(2)}/unit</span>
                        <span>•</span>
                        <span>{weightPerCarton} kg/carton</span>
                        {isFragile && (
                          <span className="cs-pill cs-pill-amber text-[10px] py-0 px-1.5 ml-auto">
                            Fragile
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-[var(--border-color)] flex justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  disabled={!selectedProduct}
                  className="cs-btn cs-btn-primary text-sm px-5 py-2.5 font-semibold"
                >
                  Continue to Origin &amp; Destination →
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* =========================================================
          STEP 2: ORIGIN & DESTINATION (IMAGE 2 EXACT MATCH)
          ========================================================= */}
      {currentStep === 2 && selectedProduct && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Left Column (8 cols) */}
          <div className="lg:col-span-8 space-y-5">
            {/* Step 1 Summary Card (Image 2 Match) */}
            <div className="cs-card p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-xl bg-[var(--surface-base)] border border-[var(--border-color)] flex items-center justify-center shrink-0 shadow-inner">
                  <Package size={26} className="text-[var(--accent-cyan)]" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-dim)]">
                    STEP 1 SUMMARY
                  </div>
                  <div className="text-xs font-semibold text-[var(--text-secondary)]">
                    Selected Cargo
                  </div>
                  <div className="text-sm sm:text-base font-bold text-[var(--text-high-contrast)] flex flex-wrap items-center gap-2 mt-0.5">
                    {selectedProduct.name}
                    <span className="text-xs font-mono text-[var(--text-dim)] font-normal">
                      SKU: {selectedProduct.sku}
                    </span>
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {parsedQty} boxes (Total weight: {totalWeightKg} kg / ~1 standard 20ft container)
                  </div>
                  <div className="mt-1.5 flex items-center gap-2 text-xs">
                    <span className="text-[var(--status-success)] flex items-center gap-1 font-semibold text-xs">
                      <CheckCircle2 size={13} />
                      Verified
                    </span>
                    <span className="text-[var(--text-dim)]">•</span>
                    <span className="text-amber-400 font-medium text-xs">
                      {selectedProduct.is_fragile ? "Fragile Rating: Level 2" : "Standard Freight"}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-xs font-semibold text-[var(--accent-cyan)] hover:underline flex items-center gap-1 shrink-0"
              >
                Change product
                <Pencil size={12} />
              </button>
            </div>

            {/* Step 2 Form Card (Image 2 Match) */}
            <div className="cs-card p-6 sm:p-7 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-primary-light)]">
                    STEP 2 OF 3
                  </span>
                  <h2 className="text-xl font-bold text-[var(--text-high-contrast)] mt-0.5">
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
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-[var(--text-secondary)]">
                      Origin Port
                    </label>
                    <span className="text-[11px] text-[var(--text-dim)]">Departing</span>
                  </div>
                  <div className="relative">
                    <Anchor
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-dim)]"
                    />
                    <input
                      type="text"
                      value={originPort}
                      onChange={(e) => setOriginPort(e.target.value)}
                      className="cs-input pl-10 text-sm font-medium"
                    />
                  </div>
                  <span className="text-xs text-[var(--text-dim)] mt-1.5 block">
                    Default port for Acme Ceramics warehouse
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-[var(--text-secondary)]">
                      Destination Port / City
                    </label>
                    <span className="text-[11px] text-[var(--text-dim)]">Discharge</span>
                  </div>
                  <div className="relative">
                    <Compass
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-dim)]"
                    />
                    <input
                      type="text"
                      value={destPort}
                      onChange={(e) => setDestPort(e.target.value)}
                      className="cs-input pl-10 text-sm font-medium"
                    />
                  </div>
                  <span className="text-xs text-[var(--text-dim)] mt-1.5 block">
                    East Coast Hub • Pier 7 Container Terminal
                  </span>
                </div>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center -my-2">
                <button
                  type="button"
                  onClick={handleSwapPorts}
                  className="px-3.5 py-1.5 rounded-lg bg-[var(--surface-base)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)] hover:text-white flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <RefreshCw size={13} />
                  Swap Direction
                </button>
              </div>

              {/* Cargo Ready Date */}
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  Cargo Ready Date
                </label>
                <div className="relative max-w-sm">
                  <Calendar
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-dim)]"
                  />
                  <input
                    type="date"
                    value={readyDate}
                    onChange={(e) => setReadyDate(e.target.value)}
                    className="cs-input pl-10 text-sm font-medium"
                  />
                </div>
                <span className="text-xs text-[var(--text-dim)] mt-1.5 block">
                  When your factory finishes packing and export crates are palletized.
                </span>
              </div>

              {/* Priority Choice (Image 2 Match) */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs font-bold text-[var(--text-high-contrast)] uppercase tracking-wider">
                    Select your shipment priority
                  </label>
                  <span className="text-xs text-[var(--text-dim)]">
                    Tailors our automated route ranking
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {/* Option 1: Balanced Choice */}
                  <div
                    onClick={() => setPriority("balanced")}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      priority === "balanced"
                        ? "bg-[var(--surface-overlay)] border-[var(--accent-primary)] shadow-[0_0_16px_rgba(99,102,241,0.3)]"
                        : "bg-[var(--surface-base)] border-[var(--border-color)] hover:border-[var(--border-active)]"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary-bg)] flex items-center justify-center text-[var(--accent-primary-light)]">
                        <SlidersHorizontal size={15} />
                      </div>
                      {priority === "balanced" && (
                        <CheckCircle2 size={18} className="text-[var(--accent-primary-light)]" />
                      )}
                    </div>
                    <div className="text-sm font-bold text-[var(--text-high-contrast)] mt-2.5">
                      Balanced Choice
                    </div>
                    <span className="cs-pill cs-pill-blue text-[10px] py-0 px-1.5 mt-1">
                      Recommended
                    </span>
                    <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                      Balances optimal ocean freight rates with steady 16-day schedule.
                    </p>
                  </div>

                  {/* Option 2: Lowest Price */}
                  <div
                    onClick={() => setPriority("lowest")}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      priority === "lowest"
                        ? "bg-[var(--surface-overlay)] border-[var(--accent-primary)] shadow-[0_0_16px_rgba(99,102,241,0.3)]"
                        : "bg-[var(--surface-base)] border-[var(--border-color)] hover:border-[var(--border-active)]"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-8 h-8 rounded-lg bg-[var(--status-success-bg)] flex items-center justify-center text-[var(--status-success)]">
                        <DollarSign size={15} />
                      </div>
                      {priority === "lowest" && (
                        <CheckCircle2 size={18} className="text-[var(--accent-primary-light)]" />
                      )}
                    </div>
                    <div className="text-sm font-bold text-[var(--text-high-contrast)] mt-2.5">
                      Lowest Price
                    </div>
                    <span className="cs-pill cs-pill-green text-[10px] py-0 px-1.5 mt-1">
                      Max Economy
                    </span>
                    <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                      Prioritizes slow-steaming routes with deep container carrier discounts.
                    </p>
                  </div>

                  {/* Option 3: Guaranteed Date */}
                  <div
                    onClick={() => setPriority("guaranteed")}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      priority === "guaranteed"
                        ? "bg-[var(--surface-overlay)] border-[var(--accent-primary)] shadow-[0_0_16px_rgba(99,102,241,0.3)]"
                        : "bg-[var(--surface-base)] border-[var(--border-color)] hover:border-[var(--border-active)]"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-8 h-8 rounded-lg bg-[var(--accent-cyan-bg)] flex items-center justify-center text-[var(--accent-cyan)]">
                        <Clock size={15} />
                      </div>
                      {priority === "guaranteed" && (
                        <CheckCircle2 size={18} className="text-[var(--accent-primary-light)]" />
                      )}
                    </div>
                    <div className="text-sm font-bold text-[var(--text-high-contrast)] mt-2.5">
                      Guaranteed Date
                    </div>
                    <span className="cs-pill cs-pill-cyan text-[10px] py-0 px-1.5 mt-1">
                      Direct Sailings
                    </span>
                    <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                      Direct transits avoiding transshipment hubs with expedited port slots.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 Error Banner */}
              {step2Error && (
                <div className="p-3.5 rounded-xl bg-[rgba(239,68,68,0.12)] border border-[rgba(239,68,68,0.3)] text-xs text-[var(--status-critical)] flex items-center gap-2 font-medium">
                  <AlertCircle size={16} className="shrink-0" />
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
                  className="cs-btn cs-btn-secondary text-sm px-4 py-2"
                >
                  <ArrowLeft size={15} />
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
                  className="cs-btn cs-btn-primary text-sm px-6 py-2.5 font-semibold"
                >
                  Compare 3 Available Routes
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Widgets (4 cols - IMAGE 2 MATCH) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Widget 1: Pro Supplier Tip */}
            <div className="cs-card p-5 sm:p-6 space-y-3 bg-gradient-to-br from-[var(--surface-elevated)] via-[#151c2e] to-[#121824] rounded-2xl border border-[var(--border-color)] shadow-xl">
              <div className="flex items-center gap-2 text-[var(--status-warning)]">
                <Lightbulb size={18} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  PRO SUPPLIER TIP
                </span>
              </div>
              <h3 className="text-base font-bold text-[var(--text-high-contrast)]">
                Avoid Weekend Customs Queues
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                Did you know? Shipping <strong>2 days earlier</strong> from Valencia (Nov 10 instead of Nov 12) connects directly with the Maersk Tuesday direct feeder, shaving 48 hours off US customs clearance.
              </p>
              <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between">
                <span className="text-xs text-[var(--status-success)] font-semibold flex items-center gap-1">
                  ✓ Saves approx. $340
                </span>
                <button
                  type="button"
                  onClick={handleApplyTip}
                  className="text-xs font-bold text-[var(--accent-cyan)] hover:underline"
                >
                  Apply Nov 10
                </button>
              </div>
            </div>

            {/* Widget 2: Corridor Health Status */}
            <div className="cs-card p-5 space-y-3.5 rounded-2xl border border-[var(--border-color)] shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                  <Compass size={15} className="text-[var(--accent-cyan)]" />
                  Corridor Health Status
                </h3>
              </div>

              {/* Route banner graphic */}
              <div className="rounded-xl bg-gradient-to-r from-[#172554] to-[#0f172a] border border-[#1e3a8a] p-3.5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--text-high-contrast)]">
                    Valencia to NY/NJ
                  </span>
                  <span className="cs-pill cs-pill-green text-[10px] py-0 px-2 font-semibold">
                    Normal Flow
                  </span>
                </div>
                <div className="text-[11px] text-[var(--accent-cyan-light)] mt-1">
                  Direct Transatlantic Lane • High Velocity
                </div>
              </div>

              <div className="space-y-2.5 text-xs pt-1">
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
            <div className="cs-card p-4 rounded-xl flex items-center gap-3 bg-[var(--surface-base)] border border-[var(--border-color)] shadow-md">
              <div className="w-10 h-10 rounded-full bg-[var(--accent-primary-bg)] border border-[rgba(99,102,241,0.3)] flex items-center justify-center text-[var(--accent-primary-light)] shrink-0">
                <MessageSquare size={17} />
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
          <div className="flex items-center gap-2">
            <span className="cs-pill cs-pill-green text-xs font-semibold">
              ✓ All quotes backed by ChainSight Freight Escrow
            </span>
          </div>

          {/* Shipment Summary Bar */}
          <div className="cs-card p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary-bg)] border border-[rgba(99,102,241,0.3)] flex items-center justify-center text-[var(--accent-primary-light)] shrink-0">
                <Package size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm sm:text-base text-[var(--text-high-contrast)]">
                    {originPort.split("(")[0].trim()} → {destPort.split("/")[0].trim()}
                  </span>
                  <span className="text-xs text-[var(--text-dim)] font-medium">FCL 20ft Standard</span>
                </div>
                <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Shipping {parsedQty} boxes of {selectedProduct.name} • Est. weight {totalWeightKg} kg • Cargo ready {readyDate}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="text-xs font-semibold text-[var(--accent-cyan)] hover:underline shrink-0"
            >
              Modify Corridor Details
            </button>
          </div>

          {/* 3 Route Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {sampleRouteOptions.map((opt) => {
              const isSelected = selectedRouteId === opt.id;
              const isSafest = opt.id === "safest";

              return (
                <div
                  key={opt.id}
                  onClick={() => setSelectedRouteId(opt.id)}
                  className={`cs-card p-5 flex flex-col justify-between cursor-pointer transition-all rounded-2xl ${
                    isSelected
                      ? "border-[var(--accent-primary)] shadow-[0_0_24px_rgba(99,102,241,0.35)] bg-[var(--surface-overlay)]"
                      : "border-[var(--border-color)] hover:border-[var(--border-active)] bg-[var(--surface-elevated)]"
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          {isSafest && (
                            <Star size={13} className="text-amber-400 fill-amber-400" />
                          )}
                          <span className="font-bold text-base text-[var(--text-high-contrast)]">
                            {opt.label}
                          </span>
                        </div>
                        <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                          {opt.tagline}
                        </div>
                      </div>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center shrink-0">
                          <Check size={12} />
                        </span>
                      )}
                    </div>

                    <div className="py-2 border-y border-[var(--border-color)] flex items-baseline justify-between">
                      <div>
                        <div className="text-2xl font-bold text-[var(--text-high-contrast)]">
                          {opt.price}
                        </div>
                        <div className="text-xs text-[var(--text-dim)]">Guaranteed Escrow Rate</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-[var(--text-high-contrast)]">
                          {opt.transitDays} Days
                        </div>
                        <div className="text-xs text-[var(--text-dim)]">{opt.arrivalDate}</div>
                      </div>
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed italic">
                      {opt.carrierDescription}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[var(--border-color)]">
                    <button
                      type="button"
                      className={`w-full cs-btn text-xs sm:text-sm font-semibold py-2 ${
                        isSelected ? "cs-btn-primary" : "cs-btn-secondary"
                      }`}
                    >
                      {isSelected ? "Selected ✓" : "Choose this route →"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sticky Bottom Bar */}
          <div className="sticky bottom-4 z-20 cs-card p-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[var(--surface-elevated)]/95 backdrop-blur-md border border-[var(--border-active)] shadow-2xl rounded-2xl">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="cs-btn cs-btn-secondary text-xs sm:text-sm"
            >
              <ArrowLeft size={15} />
              Back: Corridor Setup
            </button>

            <div className="text-xs sm:text-sm text-center">
              <span className="text-[var(--text-dim)]">Selected Plan: </span>
              <strong className="text-[var(--text-high-contrast)]">
                {selectedRoute.label} ({selectedRoute.price})
              </strong>
            </div>

            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="cs-btn cs-btn-primary text-xs sm:text-sm font-semibold px-5 py-2.5"
            >
              Continue to Review &amp; Lock Quote
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          STEP 4: REVIEW & LOCK FREIGHT QUOTE
          ========================================================= */}
      {currentStep === 4 && selectedProduct && (
        <div className="cs-card p-6 sm:p-8 space-y-6 max-w-2xl mx-auto rounded-2xl shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[var(--accent-primary-bg)] text-[var(--accent-primary-light)] flex items-center justify-center mx-auto shadow-inner">
              <Shield size={28} />
            </div>
            <h2 className="text-2xl font-bold text-[var(--text-high-contrast)]">
              {quoteLocked ? "Quote Successfully Locked!" : "Review & Lock Freight Escrow"}
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              {quoteLocked
                ? `Your booking request #${createdShipment?.tracking_number || "CS-CONFIRMED"} has been successfully created and linked to your account.`
                : "Your selected rate is protected for 48 hours without demurrage liability."}
            </p>
          </div>

          {bookingError && (
            <div className="p-3.5 rounded-xl bg-[var(--status-critical-bg)] border border-[var(--status-critical-border)] text-[var(--status-critical)] text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{bookingError}</span>
            </div>
          )}

          <div className="p-5 rounded-xl bg-[var(--surface-base)] border border-[var(--border-color)] space-y-3 text-sm">
            <div className="flex justify-between py-1.5 border-b border-[var(--border-color)]">
              <span className="text-[var(--text-secondary)]">Product &amp; Quantity</span>
              <span className="font-bold text-[var(--text-high-contrast)]">
                {selectedProduct.name} ({parsedQty} units)
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[var(--border-color)]">
              <span className="text-[var(--text-secondary)]">Corridor</span>
              <span className="font-bold text-[var(--text-high-contrast)]">
                {originPort.split("(")[0]} → {destPort.split("/")[0]}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[var(--border-color)]">
              <span className="text-[var(--text-secondary)]">Selected Plan</span>
              <span className="font-bold text-[var(--accent-primary-light)]">
                {selectedRoute.label}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[var(--border-color)]">
              <span className="text-[var(--text-secondary)]">Estimated Transit</span>
              <span className="font-bold text-[var(--text-high-contrast)]">
                {selectedRoute.transitDays} Days ({selectedRoute.arrivalDate})
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[var(--border-color)]">
              <span className="text-[var(--text-secondary)]">Total Escrow Quote</span>
              <span className="text-lg font-bold text-[var(--text-high-contrast)]">
                {selectedRoute.price} USD
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[var(--text-secondary)]">Cargo Ready Date</span>
              <span className="font-semibold text-[var(--text-high-contrast)]">{readyDate}</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              disabled={submittingBooking || quoteLocked}
              className="cs-btn cs-btn-secondary text-sm w-full sm:w-auto px-5 py-2.5"
            >
              <ArrowLeft size={15} />
              Back to Options
            </button>
            {quoteLocked ? (
              <Link
                to="/my-shipments"
                className="cs-btn cs-btn-primary text-sm w-full sm:w-auto text-center px-6 py-2.5 font-semibold"
              >
                Go to My Shipments →
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleLockQuote}
                disabled={submittingBooking}
                className="cs-btn cs-btn-primary text-sm w-full sm:w-auto px-6 py-2.5 font-semibold"
              >
                {submittingBooking ? (
                  <span className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    Submitting Booking…
                  </span>
                ) : (
                  "Lock Quote & Submit Booking ✓"
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onSuccess={(newProd) => {
          setProducts((prev) => [newProd, ...prev]);
          handleSelectProduct(newProd);
        }}
      />
    </div>
  );
}
