import { Link } from "react-router-dom";
import { useProducts } from "../contexts/ProductsContext";
import SectionHeading from "../components/SectionHeading";
import ProductGrid from "../components/ProductGrid";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";

export default function HomePage() {
  const { products, loading, error } = useProducts();

  const featuredProducts = products.filter((product) => product.featured).slice(0, 8);
  const showcaseProducts = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 8);

  const categoryStats = ["fashion", "beauty", "gadgets", "home", "sports"].map((category) => ({
    category,
    count: products.filter((product) => product.category === category).length
  }));

  return (
    <div className="space-y-8">
      <section className="card-surface relative overflow-hidden p-8 md:p-10">
        <div className="absolute -top-20 right-0 h-56 w-56 rounded-full bg-cloud-200/70 blur-2xl" />
        <div className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-white/80 blur-3xl" />

        <div className="relative grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-end">
          <div>
            <p className="mb-3 inline-flex rounded-full bg-cloud-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-cloud-700">
              Fresh drop collection
            </p>
            <h1 className="sky-title max-w-2xl text-4xl leading-tight md:text-5xl">
              Discover products quickly, compare variants, and inquire in one tap.
            </h1>
            <p className="mt-5 max-w-xl text-slate-600">
              A cleaner Shopee-style browsing flow focused on showcasing your products. No cluttered checkout, just high-conversion product discovery.
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
              <p className="text-sm font-semibold text-slate-500">No checkout flow</p>
              <p className="mt-2 text-lg font-extrabold text-cloud-700">All purchase intent goes to Messenger inquiry</p>
            </article>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {categoryStats.map((item) => (
          <article key={item.category} className="card-surface p-4 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{item.category}</p>
            <p className="mt-2 text-2xl font-black text-cloud-900">{item.count}</p>
          </article>
        ))}
      </section>

      <section>
        <SectionHeading
          title="Featured Products"
          description="Click any card to open the full product page with gallery, variants, and video preview."
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
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-cloud-700">Fast browsing</p>
          <h3 className="sky-title mt-2 text-2xl">Smart category flow</h3>
          <p className="mt-3 text-sm text-slate-600">Filter by category and variant style to help visitors find products faster.</p>
        </article>
        <article className="card-surface p-6">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-cloud-700">Variant preview</p>
          <h3 className="sky-title mt-2 text-2xl">Design focused product pages</h3>
          <p className="mt-3 text-sm text-slate-600">Each product detail screen lets users switch variants and instantly preview selected design.</p>
        </article>
        <article className="card-surface p-6">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-cloud-700">Direct contact</p>
          <h3 className="sky-title mt-2 text-2xl">Messenger inquiries</h3>
          <p className="mt-3 text-sm text-slate-600">Floating Messenger CTA appears across the site for quick customer contact and conversion.</p>
        </article>
      </section>
    </div>
  );
}
