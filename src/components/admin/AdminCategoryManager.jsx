export default function AdminCategoryManager({
  categories,
  categoryForm,
  onCategoryFormChange,
  onCategorySubmit,
  onCategoryDelete,
  categoryMessage,
  categoryError,
  busy
}) {
  return (
    <section className="card-surface p-6">
      <h2 className="sky-title text-3xl">Category Management</h2>
      <p className="mt-2 text-sm text-slate-600">Create and manage product categories used in storefront filters and product forms.</p>

      <form
        className="mt-5 grid gap-3 md:grid-cols-3"
        onSubmit={(event) => {
          event.preventDefault();
          onCategorySubmit();
        }}
      >
        <input
          value={categoryForm.name}
          onChange={(event) => onCategoryFormChange("name", event.target.value)}
          type="text"
          placeholder="Category name"
          className="rounded-2xl border border-cloud-200 bg-white px-4 py-3 text-sm focus:border-cloud-500 focus:outline-none"
          required
        />
        <input
          value={categoryForm.image}
          onChange={(event) => onCategoryFormChange("image", event.target.value)}
          type="url"
          placeholder="Category image URL (optional)"
          className="rounded-2xl border border-cloud-200 bg-white px-4 py-3 text-sm focus:border-cloud-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-2xl bg-cloud-500 px-6 py-3 text-sm font-bold text-white hover:bg-cloud-700 disabled:opacity-70"
        >
          Save category
        </button>
      </form>

      {categoryMessage ? (
        <p className={`mt-4 rounded-xl border px-4 py-3 text-sm font-semibold ${categoryError ? "border-rose-200 bg-rose-50 text-rose-700" : "border-cloud-200 bg-white text-slate-700"}`}>
          {categoryMessage}
        </p>
      ) : null}

      <div className="mt-6 grid gap-3">
        {categories.map((category) => (
          <article key={category.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cloud-200 bg-white p-4">
            <div className="flex items-center gap-3">
              {category.image ? <img src={category.image} alt={category.name} className="h-10 w-10 rounded-xl object-cover" /> : null}
              <div>
                <p className="font-bold text-cloud-900">{category.name}</p>
                <p className="text-xs text-slate-500">{category.slug}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onCategoryDelete(category)}
              disabled={busy}
              className="rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-70"
            >
              Delete
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
