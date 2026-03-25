export default function AdminProductForm({
  form,
  setForm,
  onSubmit,
  onCancel,
  isEditing,
  busy,
  formMessage,
  formError
}) {
  const imageUrlList = String(form.imageUrlsText || "")
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <section className="card-surface p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="sky-title text-xl sm:text-3xl">{isEditing ? "Edit Product" : "Add Product"}</h2>
          <p className="mt-1 text-xs text-slate-600 sm:text-sm">Simple inventory form for single-store products.</p>
        </div>
        {isEditing ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-cloud-200 bg-white px-4 py-2 text-sm font-bold text-cloud-700 hover:border-cloud-400"
          >
            Cancel edit
          </button>
        ) : null}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
        className="grid gap-3"
      >
        <input
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          type="text"
          placeholder="Product Name"
          className="rounded-2xl border border-cloud-200 bg-white px-3.5 py-3 text-sm focus:border-cloud-500 focus:outline-none"
          required
        />

        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={form.price}
            onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
            type="number"
            min="0"
            step="0.01"
            placeholder="Price"
            className="rounded-2xl border border-cloud-200 bg-white px-3.5 py-3 text-sm focus:border-cloud-500 focus:outline-none"
          />
          <input
            value={form.stocks}
            onChange={(event) => setForm((current) => ({ ...current, stocks: event.target.value }))}
            type="number"
            min="0"
            step="1"
            placeholder="Stocks"
            className="rounded-2xl border border-cloud-200 bg-white px-3.5 py-3 text-sm focus:border-cloud-500 focus:outline-none"
            required
          />
        </div>

        <input
          value={form.size}
          onChange={(event) => setForm((current) => ({ ...current, size: event.target.value }))}
          type="text"
          placeholder="Size (example: Free Size or S, M, L)"
          className="rounded-2xl border border-cloud-200 bg-white px-3.5 py-3 text-sm focus:border-cloud-500 focus:outline-none"
        />

        <textarea
          value={form.description}
          onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          rows={3}
          placeholder="Description"
          className="rounded-2xl border border-cloud-200 bg-white px-3.5 py-3 text-sm focus:border-cloud-500 focus:outline-none"
          required
        />

        <textarea
          value={form.imageUrlsText || ""}
          onChange={(event) => setForm((current) => ({ ...current, imageUrlsText: event.target.value }))}
          rows={4}
          placeholder={"Image URLs (one per line)\nhttps://...\nhttps://..."}
          className="rounded-2xl border border-cloud-200 bg-white px-3.5 py-3 text-sm focus:border-cloud-500 focus:outline-none"
          required
        />

        <input
          value={form.video}
          onChange={(event) => setForm((current) => ({ ...current, video: event.target.value }))}
          type="url"
          placeholder="Video URL (optional)"
          className="rounded-2xl border border-cloud-200 bg-white px-3.5 py-3 text-sm focus:border-cloud-500 focus:outline-none"
        />

        {imageUrlList.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-cloud-200 bg-white p-2">
            <img src={imageUrlList[0]} alt="Preview" className="aspect-[4/3] w-full rounded-xl object-cover" />
            <p className="px-1 pt-2 text-xs font-semibold text-slate-600">
              {imageUrlList.length} image URL{imageUrlList.length > 1 ? "s" : ""} added
            </p>
          </div>
        ) : null}

        <div>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-2xl bg-cloud-500 px-6 py-3 text-sm font-bold text-white hover:bg-cloud-700 disabled:opacity-70 sm:w-auto"
          >
            {busy ? "Saving..." : isEditing ? "Update Product" : "Save Product"}
          </button>
        </div>
      </form>

      {formMessage ? (
        <p
          className={`mt-4 rounded-xl border px-4 py-3 text-sm font-semibold ${
            formError ? "border-rose-200 bg-rose-50 text-rose-700" : "border-cloud-200 bg-white text-slate-700"
          }`}
        >
          {formMessage}
        </p>
      ) : null}
    </section>
  );
}
