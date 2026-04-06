import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useProducts } from "../contexts/ProductsContext";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import ProductGrid from "../components/ProductGrid";
import ProductDetailModal from "../components/ProductDetailModal";
import CustomerPhotoGallery from "../components/CustomerPhotoGallery";
import { SITE_CONFIG } from "../config/site";

export default function HomePage() {
  const { products, customerImages, categories, loading, error, warning } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchParams, setSearchParams] = useSearchParams();

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

  const scrollToCustomerPhotos = () => {
    const section = document.getElementById("customer-photos");
    if (!section) {
      return;
    }

    section.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const requestedSlug = String(searchParams.get("product") || "").trim().toLowerCase();
    if (!requestedSlug) {
      if (selectedProduct) {
        setSelectedProduct(null);
      }
      return;
    }

    const found = allProducts.find(
      (item) => String(item?.slug || "").trim().toLowerCase() === requestedSlug
    );

    if (found && found.id !== selectedProduct?.id) {
      setSelectedProduct(found);
    }
  }, [allProducts, searchParams, selectedProduct]);

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);

    const slug = String(product?.slug || "").trim();
    if (!slug) {
      return;
    }

    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set("product", slug);
      return next;
    });
  };

  const handleCloseProduct = () => {
    setSelectedProduct(null);

    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.delete("product");
      return next;
    });
  };

  return (
    <div className="space-y-3 sm:space-y-7">
      {warning ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
          {warning}
        </div>
      ) : null}

      <section className="card-surface relative overflow-hidden px-3 py-3 sm:px-8 sm:py-10">
        <div className="absolute -top-20 right-0 h-72 w-72 rounded-full bg-cloud-200/70 blur-3xl" />
        <div className="absolute -bottom-24 -left-8 h-72 w-72 rounded-full bg-blue-200/45 blur-3xl" />

        <div className="relative max-w-2xl space-y-1.5 sm:space-y-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cloud-700">STORE</p>
          <h1 className="sky-title text-xl leading-tight sm:text-5xl">Quality Products</h1>
          <p className="text-xs font-semibold text-slate-700 sm:text-lg">Simple.Quality.</p>
        </div>
      </section>

      <section id="products" className="space-y-2 sm:space-y-3">
        <div className="flex items-center justify-between gap-1.5 sm:gap-2">
          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:gap-2">
            {categoryOptions.map((category) => {
              const active = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`whitespace-nowrap rounded-full border px-2 py-1 text-[11px] font-bold leading-none transition sm:px-3 sm:py-1.5 sm:text-xs ${
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
          {customerImages.length > 0 ? (
            <button
              type="button"
              onClick={scrollToCustomerPhotos}
              className="whitespace-nowrap rounded-full border border-cloud-200 bg-white px-2 py-1 text-[11px] font-bold leading-none text-cloud-700 transition hover:border-cloud-400 sm:px-3 sm:py-1.5 sm:text-xs"
            >
              Customer Photos
            </button>
          ) : null}
        </div>

        {!loading && !error && featuredProducts.length > 0 ? (
          <div className="space-y-2.5 sm:space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="sky-title text-xl sm:text-4xl">Featured Products</h2>
              <p className="text-xs font-semibold text-slate-600 sm:text-sm">{featuredProducts.length} featured</p>
            </div>
            <ProductGrid
              products={featuredProducts}
              onSelect={handleSelectProduct}
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
            onSelect={handleSelectProduct}
            messengerUrl={SITE_CONFIG.messengerUrl}
          />
        ) : null}
      </section>

      <CustomerPhotoGallery items={customerImages} sectionId="customer-photos" />

      <ProductDetailModal
        product={selectedProduct}
        messengerUrl={SITE_CONFIG.messengerUrl}
        onClose={handleCloseProduct}
      />
    </div>
  );
}
