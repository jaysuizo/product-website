import { Link } from "react-router-dom";
import { useProducts } from "../contexts/ProductsContext";
import SectionHeading from "../components/SectionHeading";
import ProductGrid from "../components/ProductGrid";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";

export default function HomePage() {
  const { products, categories, settings, loading, error } = useProducts();

  const featuredProducts = products.filter((product) => product.featured && product.status !== "inactive").slice(0, 8);
  const showcaseProducts = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 8);

  const categoryStats = categories.map((category) => ({
    category: category.slug,
    name: category.name,
    count: products.filter((product) => product.category === category.slug).length
  }));

  return (
    <div className="space-y-8">
      <section className="card-surface relative overflow-hidden p-8 md:p-10">
        <div className="absolute -top-20 right-0 h-56 w-56 rounded-full bg-cloud-200/70 blur-2xl" />
        <div className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-white/80 blur-3xl" />

        <div className="relative grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-end">
          <div>
            <p className="mb-3 inline-flex rounded-full bg-cloud-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-cloud-700">
              Live catalog system
            </p>
            <h1 className="sky-title max-w-2xl text-4xl leading-tight md:text-5xl">
              {settings.storeName || "MyStore"} dynamic product browsing with modern Shopee-like UX.
            </h1>
            <p className="mt-5 max-w-xl text-slate-600">
              Search, filter, compare variants, and contact seller instantly via Messenger. Inventory and products are fully managed from the admin dashboard.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/shop" className="rounded-2xl bg-cloud-500 px-6 py-3 text-sm font-bold text-white hover:bg-cloud-700">
                Browse Products
              </Link>
              <Link
                to="/admin"
                className="rounded-2xl border border-cloud-200 bg-white px-6 py-3 text-sm font-bold text-cloud-700 hover:border-cloud-400"
              >
                Manage Inventory
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <article className="rounded-2xl border border-white/70 bg-white/85 p-4">
              <p className="text-sm font-semibold text-slate-500">Live products</p>
              <p className="mt-2 text-3xl font-black text-cloud-900">{products.length}</p>
            </article>
            <article className="rounded-2xl border border-white/70 bg-white/85 p-4">
              <p className="text-sm font-semibold text-slate-500">Featured now</p>
              <p className="mt-2 text-3xl font-black text-cloud-900">{featuredProducts.length}</p>
            </article>
            <article className="rounded-2xl border border-white/70 bg-white/85 p-4 sm:col-span-2">
              <p className="text-sm font-semibold text-slate-500">Contact flow</p>
              <p className="mt-2 text-lg font-extrabold text-cloud-700">Messenger-first inquiries, no checkout</p>
            </article>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {categoryStats.map((item) => (
          <article key={item.category} className="card-surface p-4 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{item.name}</p>
            <p className="mt-2 text-2xl font-black text-cloud-900">{item.count}</p>
          </article>
        ))}
      </section>

      <section>
        <SectionHeading
          title="Featured Products"
          description="Open product pages to view gallery, stock-aware variants, videos, and Messenger inquiry CTA."
          rightSlot={
            <Link to="/shop" className="text-sm font-bold text-cloud-700 hover:text-cloud-900">
              View full catalog &rarr;
            </Link>
          }
        />

        {loading ? <LoadingState label="Loading storefront products..." /> : null}
        {!loading && error ? (
          <EmptyState
            title="Firebase connection issue"
            description={error}
          />
        ) : null}
        {!loading && !error && showcaseProducts.length === 0 ? (
          <EmptyState
            title="No products yet"
            description="Sign in as admin and upload your first products to start showcasing your catalog."
          />
        ) : null}
        {!loading && !error && showcaseProducts.length > 0 ? <ProductGrid products={showcaseProducts} /> : null}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="card-surface p-6">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-cloud-700">Dynamic inventory</p>
          <h3 className="sky-title mt-2 text-2xl">Stock-aware variants</h3>
          <p className="mt-3 text-sm text-slate-600">Each variant has its own stock so customers can only select valid options.</p>
        </article>
        <article className="card-surface p-6">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-cloud-700">Admin workflow</p>
          <h3 className="sky-title mt-2 text-2xl">Fast CRUD management</h3>
          <p className="mt-3 text-sm text-slate-600">Add/edit/delete products, update categories, and manage inventory logs from one dashboard.</p>
        </article>
        <article className="card-surface p-6">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-cloud-700">Messenger funnel</p>
          <h3 className="sky-title mt-2 text-2xl">Contact seller instantly</h3>
          <p className="mt-3 text-sm text-slate-600">Replace checkout complexity with direct Messenger inquiries for faster conversions.</p>
        </article>
      </section>
    </div>
  );
}
