import { formatCurrency, sumStock } from "../../lib/format";

export default function AdminProductList({ products, onEdit, onDelete, busy }) {
  return (
    <section className="card-surface p-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <h2 className="sky-title text-3xl">Manage Products</h2>
        <p className="text-sm font-semibold text-slate-600">{products.length} product(s)</p>
      </div>

      {products.length === 0 ? (
        <p className="rounded-2xl border border-cloud-200 bg-white p-4 text-sm text-slate-600">No products yet.</p>
      ) : (
        <div className="grid gap-3">
          {products.map((product) => (
            <article key={product.id} className="rounded-2xl border border-cloud-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-extrabold text-cloud-900">{product.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">{product.shortDescription || "No short description"}</p>
                  <p className="mt-2 text-xs font-semibold text-slate-500">
                    {product.category} | {product.price ? formatCurrency(product.price) : "No price"} | {sumStock(product.inventory)} stock | {product.variants.length} variants
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(product)}
                    disabled={busy}
                    className="rounded-xl border border-cloud-200 bg-white px-4 py-2 text-sm font-bold text-cloud-700 hover:border-cloud-400 disabled:opacity-70"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(product)}
                    disabled={busy}
                    className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-70"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
