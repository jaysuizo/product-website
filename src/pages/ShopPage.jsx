import { useMemo, useState } from "react";
import { useProducts } from "../contexts/ProductsContext";
import CategoryFilterBar from "../components/CategoryFilterBar";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import ProductGrid from "../components/ProductGrid";
import SectionHeading from "../components/SectionHeading";

export default function ShopPage() {
  const { products, loading, error } = useProducts();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeVariant, setActiveVariant] = useState("all");

  const variantOptions = useMemo(() => {
    const labels = new Set();
    products.forEach((product) => {
      product.variants.forEach((variant) => {
        if (variant.label) {
          labels.add(variant.label);
        }
      });
    });

    return ["all", ...Array.from(labels)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return products.filter((product) => {
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

      if (!keyword) {
        return true;
      }

      const textBlob = [
        product.name,
        product.shortDescription,
        product.fullDescription,
        product.category,
        ...product.variants.map((variant) => `${variant.name} ${variant.label}`)
      ]
        .join(" ")
        .toLowerCase();

      return textBlob.includes(keyword);
    });
  }, [products, search, activeCategory, activeVariant]);

  return (
    <div className="space-y-6">
      <section className="card-surface p-6 md:p-8">
        <SectionHeading
          title="Shop Products"
          description="Browse your full product catalog, filter by category, and open any item for variant and video details."
        />

        <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by product, category, or variant"
            className="w-full rounded-2xl border border-cloud-200 bg-white px-4 py-3 text-sm focus:border-cloud-500 focus:outline-none"
          />
          <select
            value={activeVariant}
            onChange={(event) => setActiveVariant(event.target.value)}
            className="w-full rounded-2xl border border-cloud-200 bg-white px-4 py-3 text-sm focus:border-cloud-500 focus:outline-none"
          >
            {variantOptions.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? "All variants" : option}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <CategoryFilterBar activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
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
      {!loading && !error && filteredProducts.length > 0 ? <ProductGrid products={filteredProducts} /> : null}
    </div>
  );
}
