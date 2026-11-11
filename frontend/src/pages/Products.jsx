import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Package,
  Plus,
  Search,
  Anchor,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { getProducts, deleteProduct } from "../api/products";
import EmptyState from "../components/ui/EmptyState";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import AddProductModal from "../components/products/AddProductModal";

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(searchParams.get("add") === "true");
  const [searchQuery, setSearchQuery] = useState("");

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
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (searchParams.get("add")) {
      searchParams.delete("add");
      setSearchParams(searchParams);
    }
  };

  const handleDeleteProduct = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this product from your catalog?")) return;

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-cyan)] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--status-success)] animate-pulse" />
              CATALOG MANAGEMENT • PRODUCT SPECIFICATIONS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[var(--text-high-contrast)]">
            My Products
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1 max-w-2xl">
            Manage your export cargo portfolio, packing quantities, carton weights, and default origin ports.
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={handleOpenModal}
            className="cs-btn cs-btn-primary text-sm px-4 py-2.5 font-semibold"
          >
            <Plus size={16} />
            + Add a New Product
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative max-w-md w-full">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-dim)]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by title, SKU, or default port…"
            className="cs-input pl-10 text-sm"
          />
        </div>
        <div className="text-sm text-[var(--text-secondary)] whitespace-nowrap font-medium">
          {products.length} item{products.length === 1 ? "" : "s"} registered
        </div>
      </div>

      {/* Products Table or Empty State */}
      <div className="cs-card overflow-hidden">
        {loading ? (
          <div className="p-14 flex justify-center">
            <LoadingSpinner message="Loading catalog products…" />
          </div>
        ) : products.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<Package size={28} className="text-[var(--accent-primary-light)]" />}
              title="Your Product Catalog is Empty"
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
                  <th>PRODUCT &amp; SKU</th>
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
                    <td colSpan={7} className="text-center py-12 text-[var(--text-secondary)] text-sm">
                      No matching products found for "{searchQuery}".
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-[var(--surface-overlay)]/40 transition-colors">
                      <td>
                        <div className="font-bold text-sm text-[var(--text-high-contrast)]">
                          {p.name}
                        </div>
                        <div className="text-xs text-[var(--text-secondary)] font-mono mt-0.5">
                          {p.sku}
                        </div>
                      </td>
                      <td>
                        <div className="font-semibold text-sm text-[var(--text-high-contrast)]">
                          ${typeof p.unit_cost === "number" ? p.unit_cost.toFixed(2) : p.unit_cost}
                        </div>
                        <div className="text-xs text-[var(--text-dim)]">per unit</div>
                      </td>
                      <td>
                        <div className="font-semibold text-sm text-[var(--text-high-contrast)]">
                          {p.packing_qty || 480}
                        </div>
                        <div className="text-xs text-[var(--text-secondary)]">units / pallet</div>
                      </td>
                      <td>
                        <div className="font-semibold text-sm text-[var(--text-high-contrast)]">
                          {p.weight_per_carton || 11.2} kg
                        </div>
                        <div className="text-xs text-[var(--text-dim)]">gross weight</div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5 text-sm text-[var(--text-high-contrast)]">
                          <Anchor size={14} className="text-[var(--accent-cyan)] shrink-0" />
                          <span className="truncate">{p.default_origin_port || "Unspecified Port"}</span>
                        </div>
                      </td>
                      <td>
                        {p.is_fragile ? (
                          <span className="cs-pill cs-pill-amber text-xs">
                            Fragile (Shock-safe)
                          </span>
                        ) : (
                          <span className="cs-pill cs-pill-green text-xs">
                            Standard Freight
                          </span>
                        )}
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteProduct(p.id, e)}
                          className="p-2 rounded-lg text-[var(--text-dim)] hover:text-[var(--status-critical)] hover:bg-[rgba(239,68,68,0.1)] transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 size={16} />
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

      {/* Add A New Product Modal (Image 1 Match) */}
      <AddProductModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={() => {
          loadProductsList();
        }}
      />
    </div>
  );
}
