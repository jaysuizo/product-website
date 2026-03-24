import { useMemo, useState } from "react";
import { useProducts } from "../contexts/ProductsContext";
import CategoryFilterBar from "../components/CategoryFilterBar";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import ProductGrid from "../components/ProductGrid";
import SectionHeading from "../components/SectionHeading";
import { getProductAvailability, getProductStock } from "../lib/productModel";

const PAGE_SIZE = 12;

export default function ShopPage() {
  const { products, categories, loading, error } = useProducts();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeVariant, setActiveVariant] = useState("all");
  const [availability, setAvailability] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [maxPrice, setMaxPrice] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const variantOptions = useMemo(() => {
    const labels = new Set();
    products.forEach((product) => {
      product.variants.forEach((variant) => {
        if (variant.label) {
          labels.add(variant.label);
        }
      });
    });

    return ["all", ...Array.from(labels).sort((a, b) => a.localeCompare(b))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const parsedMaxPrice = Number.parseFloat(String(maxPrice || ""));
    const hasMaxPrice = Number.isFinite(parsedMaxPrice) && parsedMaxPrice >= 0;

    const base = products.filter((product) => {
      if (activeCategory !== "all" && product.category !== activeCategory) {
        return false;
      }

      if (activeVariant !== "all") {
        const hasVariant = product.variants.some(
          (variant) => variant.label.toLowerCase() === activeVariant.toLowerCase()
        );

        if (!hasVariant) {
          return false;
        }
      }

      const availabilityValue = getProductAvailability(product);

      if (availability === "in_stock" && !(availabilityValue === "in_stock" || availabilityValue === "low_stock")) {
        return false;
      }

      if (availability === "out_of_stock" && availabilityValue !== "out_of_stock") {
        return false;
      }

      if (availability === "low_stock" && availabilityValue !== "low_stock") {
        return false;
      }

      if (hasMaxPrice && product.price && product.price > parsedMaxPrice) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      const textBlob = [
        product.name,
        product.shortDescription,
        product.fullDescription,
        product.category,
        product.brand,
        ...product.variants.map((variant) => `${variant.type} ${variant.value} ${variant.label}`)
      ]
        .join(" ")
        .toLowerCase();

      return textBlob.includes(keyword);
    });

    return [...base].sort((a, b) => {
      if (sortBy === "name_asc") {
        return a.name.localeCompare(b.name);
      }

      if (sortBy === "price_low") {
        return Number(a.price || 0) - Number(b.price || 0);
      }

      if (sortBy === "price_high") {
        return Number(b.price || 0) - Number(a.price || 0);
      }

      if (sortBy === "stock_high") {
        return getProductStock(b) - getProductStock(a);
      }

      return Number(b.updatedAt?.seconds || 0) - Number(a.updatedAt?.seconds || 0);
    });
  }, [products, search, activeCategory, activeVariant, availability, sortBy, maxPrice]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  return (
    <div className="space-y-6">
      <section className="card-surface p-6 md:p-8">
        <SectionHeading
          title="Shop Products"
          description="Browse your full product catalog with search, filters, sorting, and stock-aware variant options."
        />

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
            placeholder="Search by product, brand, category, variant"
            className="w-full rounded-2xl border border-cloud-200 bg-white px-4 py-3 text-sm focus:border-cloud-500 focus:outline-none"
          />

          <select
            value={activeVariant}
            onChange={(event) => {
              setActiveVariant(event.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
            className="w-full rounded-2xl border border-cloud-200 bg-white px-4 py-3 text-sm focus:border-cloud-500 focus:outline-none"
          >
            {variantOptions.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? "All variants" : option}
              </option>
            ))}
          </select>

          <select
            value={availability}
            onChange={(event) => {
              setAvailability(event.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
            className="w-full rounded-2xl border border-cloud-200 bg-white px-4 py-3 text-sm focus:border-cloud-500 focus:outline-none"
          >
            <option value="all">All availability</option>
            <option value="in_stock">In stock</option>
            <option value="low_stock">Low stock</option>
            <option value="out_of_stock">Out of stock</option>
          </select>

          <input
            type="number"
            min="0"
            value={maxPrice}
            onChange={(event) => {
              setMaxPrice(event.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
            placeholder="Max price (optional)"
            className="w-full rounded-2xl border border-cloud-200 bg-white px-4 py-3 text-sm focus:border-cloud-500 focus:outline-none"
          />
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <CategoryFilterBar
            activeCategory={activeCategory}
            onCategoryChange={(value) => {
              setActiveCategory(value);
              setVisibleCount(PAGE_SIZE);
            }}
            categories={categories}
          />

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="rounded-2xl border border-cloud-200 bg-white px-4 py-3 text-sm focus:border-cloud-500 focus:outline-none"
          >
            <option value="newest">Newest</option>
            <option value="name_asc">Name (A-Z)</option>
            <option value="price_low">Price (Low to High)</option>
            <option value="price_high">Price (High to Low)</option>
            <option value="stock_high">Stock (High to Low)</option>
          </select>
        </div>
      </section>

      {loading ? <LoadingState label="Loading catalog..." /> : null}
      {!loading && error ? <EmptyState title="Cannot load products" description={error} /> : null}
      {!loading && !error && filteredProducts.length === 0 ? (
        <EmptyState
          title="No products matched"
          description="Try another search term or clear your filters to view more products."
        />
      ) : null}
      {!loading && !error && filteredProducts.length > 0 ? (
        <>
          <ProductGrid products={visibleProducts} />
          {hasMore ? (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setVisibleCount((current) => current + PAGE_SIZE)}
                className="rounded-2xl border border-cloud-200 bg-white px-6 py-3 text-sm font-bold text-cloud-700 hover:border-cloud-400"
              >
                Load more products
              </button>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
