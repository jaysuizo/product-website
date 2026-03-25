import { formatCurrency } from "../../lib/format";
import { getProductAvailability, getProductStock } from "../../lib/productModel";

const availabilityLabel = {
  in_stock: "In stock",
  out_of_stock: "Out of stock"
};

export default function AdminProductList({ products, onEdit, onDelete, busy }) {
  return (
    <section className="card-surface p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <h2 className="sky-title text-xl sm:text-3xl">Manage Products</h2>
        <p className="text-xs font-semibold text-slate-600 sm:text-sm">{products.length} product(s)</p>
      </div>

      {products.length === 0 ? (
        <p className="rounded-2xl border border-cloud-200 bg-white p-4 text-sm text-slate-600">
          No live products yet. Create your first product from Product Form.
        </p>
      ) : (
        <div className="grid gap-3">
          {products.map((product) => {
            const availability = getProductAvailability(product);

            return (
              <article key={product.id} className="rounded-2xl border border-cloud-200 bg-white p-3.5 sm:p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-12 w-12 rounded-xl object-cover sm:h-14 sm:w-14"
                      />
                    ) : (
                      <div className="grid h-12 w-12 place-items-center rounded-xl bg-cloud-100 text-xs font-bold text-cloud-700 sm:h-14 sm:w-14">
                        IMG
                      </div>
                    )}
                    <div>
                      <h3 className="text-base font-extrabold text-cloud-900 sm:text-lg">{product.name}</h3>
                      <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                        {product.description || "No description"}
                      </p>
                      <p className="mt-2 text-xs font-semibold text-slate-500">
                        {product.price ? formatCurrency(product.price) : "No price"} | {getProductStock(product)} stock |{" "}
                        {product.size || "Free Size"} |{" "}
                        {availabilityLabel[availability] || availabilityLabel.in_stock}
                      </p>
                    </div>
                  </div>

                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                    <button
                      type="button"
                      onClick={() => onEdit(product)}
                      disabled={busy}
                      className="w-full rounded-xl border border-cloud-200 bg-white px-4 py-2 text-sm font-bold text-cloud-700 hover:border-cloud-400 disabled:opacity-70 sm:w-auto"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(product)}
                      disabled={busy}
                      className="w-full rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-70 sm:w-auto"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
