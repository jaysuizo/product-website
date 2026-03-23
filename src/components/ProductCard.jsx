import { Link } from "react-router-dom";
import { formatCurrency, sumStock } from "../lib/format";

const categoryBadgeStyles = {
  fashion: "bg-rose-50 text-rose-700",
  beauty: "bg-fuchsia-50 text-fuchsia-700",
  gadgets: "bg-sky-50 text-sky-700",
  home: "bg-emerald-50 text-emerald-700",
  sports: "bg-amber-50 text-amber-700"
};

export default function ProductCard({ product }) {
  const stock = sumStock(product.inventory);

  return (
    <article className="group card-surface fade-in overflow-hidden p-0 transition hover:-translate-y-1 hover:shadow-float">
      <Link to={`/product/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-cloud-100">
          {product.featuredImage ? (
            <img
              src={product.featuredImage}
              alt={product.name}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="grid h-full place-items-center text-sm font-semibold text-cloud-700">No image yet</div>
          )}
          <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${categoryBadgeStyles[product.category] || "bg-slate-100 text-slate-700"}`}>
            {product.category}
          </span>
          {product.featured ? (
            <span className="absolute right-3 top-3 rounded-full bg-cloud-500 px-3 py-1 text-xs font-semibold text-white">
              Featured
            </span>
          ) : null}
        </div>

        <div className="space-y-3 p-5">
          <div>
            <h3 className="line-clamp-1 text-lg font-extrabold text-cloud-900">{product.name}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-slate-600">
              {product.shortDescription || "No description yet."}
            </p>
          </div>

          <div className="flex items-center justify-between text-sm">
            <p className="font-semibold text-slate-600">{stock} in stock</p>
            {product.price ? <p className="text-base font-extrabold text-cloud-700">{formatCurrency(product.price)}</p> : null}
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full border border-cloud-200 bg-white px-3 py-1 text-xs font-semibold text-cloud-700">
              {product.variants.length} variants
            </span>
            <span className="text-sm font-bold text-cloud-700">View product</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
