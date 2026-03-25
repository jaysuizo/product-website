import { useEffect, useMemo, useState } from "react";
import { useProducts } from "../contexts/ProductsContext";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import ProductGrid from "../components/ProductGrid";
import ProductDetailModal from "../components/ProductDetailModal";
import { SITE_CONFIG } from "../config/site";

export default function HomePage() {
  const { products, categories, loading, error, warning } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const allProducts = useMemo(() => products, [products]);

  const categoryOptions = useMemo(() => {
    const normalizeCategoryId = (value) =>
      String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    const map = new Map();

    categories.forEach((item) => {
      const name = String(item?.name || "").trim();
      if (!name) return;
      const id = item.slug || normalizeCategoryId(name);
      if (normalizeCategoryId(id) === "all") return;
      if (!map.has(id)) {
        map.set(id, { id, name });
      }
    });

    allProducts.forEach((item) => {
      const name = String(item?.category || "Uncategorized").trim();
      const id = normalizeCategoryId(name);
      if (id === "all") return;
      if (!map.has(id)) {
        map.set(id, { id, name });
      }
    });

    return [{ id: "all", name: "All" }, ...Array.from(map.values())];
  }, [allProducts, categories]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "all") {
      return allProducts;
    }

    const toCategoryId = (value) =>
      String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    return allProducts.filter((item) => toCategoryId(item.category) === selectedCategory);
  }, [allProducts, selectedCategory]);

  const featuredProducts = useMemo(
    () => filteredProducts.filter((item) => item.featured),
    [filteredProducts]
  );

  useEffect(() => {
    if (!categoryOptions.some((item) => item.id === selectedCategory)) {
      setSelectedCategory("all");
    }
  }, [categoryOptions, selectedCategory]);

  return (
    <div className="space-y-3 sm:space-y-7">
      {warning ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
          {warning}
        </div>
      ) : null}

      <section className="card-surface relative overflow-hidden px-4 py-4 sm:px-8 sm:py-10">
        <div className="absolute -top-20 right-0 h-72 w-72 rounded-full bg-cloud-200/70 blur-3xl" />
        <div className="absolute -bottom-24 -left-8 h-72 w-72 rounded-full bg-blue-200/45 blur-3xl" />

        <div className="relative max-w-2xl space-y-2 sm:space-y-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cloud-700">STORE</p>
          <h1 className="sky-title text-xl leading-tight sm:text-5xl">Quality Products</h1>
          <p className="text-xs font-semibold text-slate-700 sm:text-lg">Simple.Quality.</p>
        </div>
      </section>

      <section id="products" className="space-y-2 sm:space-y-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categoryOptions.map((category) => {
            const active = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategory(category.id)}
                className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                  active
                    ? "border-cloud-500 bg-cloud-500 text-white"
                    : "border-cloud-200 bg-white text-cloud-700 hover:border-cloud-400"
                }`}
              >
                {category.name}
              </button>
            );
          })}
        </div>

        {!loading && !error && featuredProducts.length > 0 ? (
          <div className="space-y-2.5 sm:space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="sky-title text-xl sm:text-4xl">Featured Products</h2>
              <p className="text-xs font-semibold text-slate-600 sm:text-sm">{featuredProducts.length} featured</p>
            </div>
            <ProductGrid
              products={featuredProducts}
              onSelect={setSelectedProduct}
              messengerUrl={SITE_CONFIG.messengerUrl}
            />
          </div>
        ) : null}

        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="sky-title text-xl sm:text-4xl">Products</h2>
          <p className="text-xs font-semibold text-slate-600 sm:text-sm">{filteredProducts.length} items</p>
        </div>

        {loading ? <LoadingState kind="products" label="Loading products..." /> : null}
        {!loading && error ? <EmptyState title="Cannot load products" description={error} /> : null}
        {!loading && !error && filteredProducts.length === 0 ? (
          <EmptyState
            title={allProducts.length === 0 ? "No products yet" : "No products in this category"}
            description={
              allProducts.length === 0
                ? "Add products from admin to publish your catalog."
                : "Try another category."
            }
          />
        ) : null}
        {!loading && !error && filteredProducts.length > 0 ? (
          <ProductGrid
            products={filteredProducts}
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
