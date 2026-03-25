import { useMemo, useState } from "react";
import { useProducts } from "../contexts/ProductsContext";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import ProductGrid from "../components/ProductGrid";
import ProductDetailModal from "../components/ProductDetailModal";
import { SITE_CONFIG } from "../config/site";

export default function HomePage() {
  const { products, loading, error, warning } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState(null);

  const allProducts = useMemo(() => products, [products]);

  return (
    <div className="space-y-4 sm:space-y-7">
      {warning ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
          {warning}
        </div>
      ) : null}

      <section className="card-surface relative overflow-hidden px-4 py-5 sm:px-8 sm:py-10">
        <div className="absolute -top-20 right-0 h-72 w-72 rounded-full bg-cloud-200/70 blur-3xl" />
        <div className="absolute -bottom-24 -left-8 h-72 w-72 rounded-full bg-blue-200/45 blur-3xl" />

        <div className="relative max-w-2xl space-y-2.5 sm:space-y-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cloud-700">Single Store</p>
          <h1 className="sky-title text-2xl leading-tight sm:text-5xl">Premium Products</h1>
          <p className="text-sm font-semibold text-slate-700 sm:text-lg">Simple. Clean. Quality.</p>
        </div>
      </section>

      <section id="products" className="space-y-2.5 sm:space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="sky-title text-xl sm:text-4xl">Products</h2>
          <p className="text-xs font-semibold text-slate-600 sm:text-sm">{allProducts.length} items</p>
        </div>

        {loading ? <LoadingState kind="products" label="Loading products..." /> : null}
        {!loading && error ? <EmptyState title="Cannot load products" description={error} /> : null}
        {!loading && !error && allProducts.length === 0 ? (
          <EmptyState title="No products yet" description="Add products from admin to publish your catalog." />
        ) : null}
        {!loading && !error && allProducts.length > 0 ? (
          <ProductGrid
            products={allProducts}
            onSelect={setSelectedProduct}
            messengerUrl={SITE_CONFIG.messengerUrl}
          />
        ) : null}
      </section>

      <ProductDetailModal
        product={selectedProduct}
        messengerUrl={SITE_CONFIG.messengerUrl}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
