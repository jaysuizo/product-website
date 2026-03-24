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
  return (
    <section className="card-surface p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="sky-title text-xl sm:text-3xl">{isEditing ? "Edit Product" : "Add Product"}</h2>
          <p className="mt-1 text-xs text-slate-600 sm:text-sm">Spark mode form: up to 5 image URLs and optional video URL.</p>
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
        className="grid gap-4"
      >
        <input
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          type="text"
          placeholder="Product Name"
          className="rounded-2xl border border-cloud-200 bg-white px-3.5 py-3 text-sm focus:border-cloud-500 focus:outline-none sm:px-4"
          required
        />

        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={form.price}
            onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
            type="number"
            min="0"
            step="0.01"
            placeholder="Price (optional)"
            className="rounded-2xl border border-cloud-200 bg-white px-3.5 py-3 text-sm focus:border-cloud-500 focus:outline-none sm:px-4"
          />
          <input
            value={form.sizesText}
            onChange={(event) => setForm((current) => ({ ...current, sizesText: event.target.value }))}
            type="text"
            placeholder="Sizes / Variants (comma-separated: Small, Medium, Large)"
            className="rounded-2xl border border-cloud-200 bg-white px-3.5 py-3 text-sm focus:border-cloud-500 focus:outline-none sm:px-4"
          />
        </div>

        <label className="inline-flex w-fit items-center gap-2 rounded-xl border border-cloud-200 bg-white px-3 py-2 text-sm font-semibold text-cloud-800">
          <input
            type="checkbox"
            checked={Boolean(form.featured)}
            onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))}
            className="h-4 w-4 accent-cloud-500"
          />
          Mark as featured product
        </label>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-cloud-200 bg-white p-3.5 sm:p-4">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-cloud-700">Image URLs (Max 5)</p>
            <p className="mt-1 text-xs text-slate-500">Paste image links (one per line). Spark compatible.</p>
            <textarea
              value={form.imageUrlsText || ""}
              onChange={(event) => setForm((current) => ({ ...current, imageUrlsText: event.target.value }))}
              rows={5}
              placeholder={"https://.../image1.jpg\nhttps://.../image2.jpg"}
              className="mt-3 w-full rounded-xl border border-cloud-200 bg-white px-3.5 py-3 text-sm focus:border-cloud-500 focus:outline-none"
            />
            {Array.isArray(form.images) && form.images.length > 0 ? (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {form.images.slice(0, 5).map((url) => (
                  <img key={url} src={url} alt="Current product" className="h-20 w-full rounded-lg object-cover" />
                ))}
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-cloud-200 bg-white p-3.5 sm:p-4">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-cloud-700">Video URL (Optional)</p>
            <p className="mt-1 text-xs text-slate-500">Paste YouTube/Vimeo/direct video link.</p>
            <input
              type="url"
              value={form.video || ""}
              onChange={(event) => setForm((current) => ({ ...current, video: event.target.value }))}
              placeholder="https://..."
              className="mt-3 w-full rounded-xl border border-cloud-200 bg-white px-3.5 py-3 text-sm focus:border-cloud-500 focus:outline-none sm:px-4"
            />
            {form.video ? (
              <video src={form.video} controls className="mt-3 max-h-36 w-full rounded-lg border border-cloud-100 bg-slate-950" />
            ) : null}
          </div>
        </div>

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
