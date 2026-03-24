function updateInventoryRow(setForm, index, key, value) {
  setForm((current) => {
    const next = [...current.inventory];
    next[index] = {
      ...next[index],
      [key]: key === "stock" ? Number.parseInt(value || 0, 10) || 0 : value
    };
    return { ...current, inventory: next };
  });
}

function updateVariantRow(setForm, index, key, value) {
  setForm((current) => {
    const next = [...current.variants];
    next[index] = {
      ...next[index],
      [key]: value
    };
    return { ...current, variants: next };
  });
}

export default function AdminProductForm({
  form,
  setForm,
  categories,
  selectedFiles,
  setSelectedFiles,
  removedMediaKeys,
  onToggleRemoveMedia,
  onSubmit,
  onCancel,
  isEditing,
  busy,
  formMessage,
  formError
}) {
  return (
    <section className="card-surface p-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="sky-title text-3xl">{isEditing ? "Edit Product" : "Add Product"}</h2>
          <p className="mt-1 text-sm text-slate-600">Create dynamic products with category, variants, and inventory.</p>
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
        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            type="text"
            placeholder="Product name"
            className="rounded-2xl border border-cloud-200 bg-white px-4 py-3 text-sm focus:border-cloud-500 focus:outline-none"
            required
          />
          <input
            value={form.slug}
            onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
            type="text"
            placeholder="Slug (optional)"
            className="rounded-2xl border border-cloud-200 bg-white px-4 py-3 text-sm focus:border-cloud-500 focus:outline-none"
          />
          <select
            value={form.category}
            onChange={(event) => {
              const selected = categories.find((category) => category.slug === event.target.value);
              setForm((current) => ({
                ...current,
                category: event.target.value,
                categoryLabel: selected?.name || current.categoryLabel
              }));
            }}
            className="rounded-2xl border border-cloud-200 bg-white px-4 py-3 text-sm focus:border-cloud-500 focus:outline-none"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
          <input
            value={form.brand}
            onChange={(event) => setForm((current) => ({ ...current, brand: event.target.value }))}
            type="text"
            placeholder="Brand (optional)"
            className="rounded-2xl border border-cloud-200 bg-white px-4 py-3 text-sm focus:border-cloud-500 focus:outline-none"
          />
          <select
            value={form.status}
            onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
            className="rounded-2xl border border-cloud-200 bg-white px-4 py-3 text-sm focus:border-cloud-500 focus:outline-none"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <input
            value={form.price}
            onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
            type="number"
            min="0"
            step="0.01"
            placeholder="Price in PHP (optional)"
            className="rounded-2xl border border-cloud-200 bg-white px-4 py-3 text-sm focus:border-cloud-500 focus:outline-none"
          />
        </div>

        <textarea
          value={form.shortDescription}
          onChange={(event) => setForm((current) => ({ ...current, shortDescription: event.target.value }))}
          placeholder="Short description"
          rows={2}
          className="rounded-2xl border border-cloud-200 bg-white px-4 py-3 text-sm focus:border-cloud-500 focus:outline-none"
        />

        <textarea
          value={form.fullDescription}
          onChange={(event) => setForm((current) => ({ ...current, fullDescription: event.target.value }))}
          placeholder="Full product description"
          rows={4}
          className="rounded-2xl border border-cloud-200 bg-white px-4 py-3 text-sm focus:border-cloud-500 focus:outline-none"
        />

        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={form.mainImage || form.featuredImage || ""}
            onChange={(event) => setForm((current) => ({ ...current, mainImage: event.target.value, featuredImage: event.target.value }))}
            type="url"
            placeholder="Main image URL (optional)"
            className="rounded-2xl border border-cloud-200 bg-white px-4 py-3 text-sm focus:border-cloud-500 focus:outline-none"
          />
          <input
            value={form.videoUrl}
            onChange={(event) => setForm((current) => ({ ...current, videoUrl: event.target.value }))}
            type="url"
            placeholder="Video URL (YouTube/Vimeo/Storage)"
            className="rounded-2xl border border-cloud-200 bg-white px-4 py-3 text-sm focus:border-cloud-500 focus:outline-none"
          />
          <input
            value={form.messengerLink}
            onChange={(event) => setForm((current) => ({ ...current, messengerLink: event.target.value }))}
            type="url"
            placeholder="Messenger URL (optional per product)"
            className="rounded-2xl border border-cloud-200 bg-white px-4 py-3 text-sm focus:border-cloud-500 focus:outline-none md:col-span-2"
          />
        </div>

        <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))}
          />
          Show this as featured product
        </label>

        <div className="rounded-2xl border border-cloud-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-cloud-700">Gallery Images</h3>
            <button
              type="button"
              onClick={() => setForm((current) => ({ ...current, galleryImages: [...current.galleryImages, ""] }))}
              className="rounded-xl border border-cloud-200 px-3 py-1 text-xs font-bold text-cloud-700"
            >
              Add URL
            </button>
          </div>
          <div className="grid gap-2">
            {form.galleryImages.map((image, index) => (
              <div key={`gallery-${index}`} className="flex gap-2">
                <input
                  value={image}
                  onChange={(event) => {
                    const value = event.target.value;
                    setForm((current) => {
                      const next = [...current.galleryImages];
                      next[index] = value;
                      return { ...current, galleryImages: next };
                    });
                  }}
                  type="url"
                  placeholder="https://..."
                  className="w-full rounded-xl border border-cloud-200 px-3 py-2 text-sm focus:border-cloud-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      galleryImages: current.galleryImages.filter((_, rowIndex) => rowIndex !== index)
                    }))
                  }
                  className="rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-cloud-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-cloud-700">Variant Inventory</h3>
            <button
              type="button"
              onClick={() =>
                setForm((current) => ({
                  ...current,
                  variants: [
                    ...current.variants,
                    {
                      id: `variant-${Date.now()}`,
                      type: "design",
                      value: "",
                      label: "",
                      image: "",
                      colorHex: "",
                      stock: 0,
                      sku: "",
                      priceOverride: ""
                    }
                  ]
                }))
              }
              className="rounded-xl border border-cloud-200 px-3 py-1 text-xs font-bold text-cloud-700"
            >
              Add Variant
            </button>
          </div>

          <div className="grid gap-3">
            {form.variants.map((variant, index) => (
              <div key={variant.id || `variant-${index}`} className="grid gap-2 rounded-2xl border border-cloud-200 p-3 md:grid-cols-4 xl:grid-cols-8">
                <select
                  value={variant.type || "design"}
                  onChange={(event) => updateVariantRow(setForm, index, "type", event.target.value)}
                  className="rounded-xl border border-cloud-200 px-3 py-2 text-sm focus:border-cloud-500 focus:outline-none"
                >
                  <option value="color">Color</option>
                  <option value="size">Size</option>
                  <option value="design">Design</option>
                  <option value="style">Style</option>
                </select>
                <input
                  value={variant.value || ""}
                  onChange={(event) => updateVariantRow(setForm, index, "value", event.target.value)}
                  placeholder="Value"
                  className="rounded-xl border border-cloud-200 px-3 py-2 text-sm focus:border-cloud-500 focus:outline-none"
                />
                <input
                  value={variant.label || ""}
                  onChange={(event) => updateVariantRow(setForm, index, "label", event.target.value)}
                  placeholder="Label"
                  className="rounded-xl border border-cloud-200 px-3 py-2 text-sm focus:border-cloud-500 focus:outline-none"
                />
                <input
                  value={variant.image || variant.previewImage || ""}
                  onChange={(event) => updateVariantRow(setForm, index, "image", event.target.value)}
                  placeholder="Image URL"
                  className="rounded-xl border border-cloud-200 px-3 py-2 text-sm focus:border-cloud-500 focus:outline-none"
                />
                <input
                  value={variant.colorHex || ""}
                  onChange={(event) => updateVariantRow(setForm, index, "colorHex", event.target.value)}
                  placeholder="#4d8ef7"
                  className="rounded-xl border border-cloud-200 px-3 py-2 text-sm focus:border-cloud-500 focus:outline-none"
                />
                <input
                  value={variant.stock}
                  onChange={(event) => updateVariantRow(setForm, index, "stock", event.target.value)}
                  type="number"
                  min="0"
                  placeholder="Stock"
                  className="rounded-xl border border-cloud-200 px-3 py-2 text-sm focus:border-cloud-500 focus:outline-none"
                />
                <input
                  value={variant.sku || ""}
                  onChange={(event) => updateVariantRow(setForm, index, "sku", event.target.value)}
                  placeholder="SKU (optional)"
                  className="rounded-xl border border-cloud-200 px-3 py-2 text-sm focus:border-cloud-500 focus:outline-none"
                />
                <input
                  value={variant.priceOverride ?? ""}
                  onChange={(event) => updateVariantRow(setForm, index, "priceOverride", event.target.value)}
                  type="number"
                  step="0.01"
                  placeholder="Price override"
                  className="rounded-xl border border-cloud-200 px-3 py-2 text-sm focus:border-cloud-500 focus:outline-none"
                />
                <div className="md:col-span-4 xl:col-span-8">
                  <button
                    type="button"
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        variants:
                          current.variants.length > 1
                            ? current.variants.filter((_, rowIndex) => rowIndex !== index)
                            : current.variants
                      }))
                    }
                    className="rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white"
                  >
                    Remove variant
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-cloud-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-cloud-700">Additional Size Inventory</h3>
            <button
              type="button"
              onClick={() =>
                setForm((current) => ({
                  ...current,
                  inventory: [...current.inventory, { size: "", stock: 0 }]
                }))
              }
              className="rounded-xl border border-cloud-200 px-3 py-1 text-xs font-bold text-cloud-700"
            >
              Add Size
            </button>
          </div>

          <div className="grid gap-2">
            {form.inventory.map((row, index) => (
              <div key={`inventory-${index}`} className="grid gap-2 md:grid-cols-[1fr_140px_auto]">
                <input
                  value={row.size}
                  onChange={(event) => updateInventoryRow(setForm, index, "size", event.target.value)}
                  placeholder="Size"
                  className="rounded-xl border border-cloud-200 px-3 py-2 text-sm focus:border-cloud-500 focus:outline-none"
                />
                <input
                  value={row.stock}
                  onChange={(event) => updateInventoryRow(setForm, index, "stock", event.target.value)}
                  type="number"
                  min="0"
                  placeholder="Stock"
                  className="rounded-xl border border-cloud-200 px-3 py-2 text-sm focus:border-cloud-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      inventory:
                        current.inventory.length > 1
                          ? current.inventory.filter((_, rowIndex) => rowIndex !== index)
                          : current.inventory
                    }))
                  }
                  className="rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-cloud-200 bg-white p-4">
          <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-cloud-700">Upload Media</h3>
          <p className="mt-1 text-xs text-slate-500">Total media per product is limited to 20 MB.</p>
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={(event) => setSelectedFiles(Array.from(event.target.files || []))}
            className="mt-3 w-full rounded-xl border border-cloud-200 bg-white px-3 py-2 text-sm"
          />
          {selectedFiles.length > 0 ? (
            <ul className="mt-3 space-y-1 text-xs text-slate-600">
              {selectedFiles.map((file) => (
                <li key={`${file.name}-${file.size}`}>{file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)</li>
              ))}
            </ul>
          ) : null}

          {form.media.length > 0 ? (
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {form.media.map((item) => {
                const mediaKey = item.path || item.url;
                const removed = removedMediaKeys.has(mediaKey);

                return (
                  <article key={mediaKey} className={`rounded-xl border p-2 ${removed ? "border-rose-200 bg-rose-50" : "border-cloud-200 bg-white"}`}>
                    {item.type === "video" ? (
                      <video src={item.url} controls className="aspect-video w-full rounded-lg object-cover" />
                    ) : (
                      <img src={item.url} alt="Product media" className="aspect-video w-full rounded-lg object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => onToggleRemoveMedia(mediaKey)}
                      className={`mt-2 w-full rounded-lg px-3 py-1 text-xs font-bold ${
                        removed ? "bg-white text-rose-700" : "bg-rose-600 text-white"
                      }`}
                    >
                      {removed ? "Undo remove" : "Remove"}
                    </button>
                  </article>
                );
              })}
            </div>
          ) : null}
        </div>

        <div>
          <button
            type="submit"
            disabled={busy}
            className="rounded-2xl bg-cloud-500 px-6 py-3 text-sm font-bold text-white hover:bg-cloud-700 disabled:opacity-70"
          >
            {busy ? "Saving..." : isEditing ? "Update Product" : "Save Product"}
          </button>
        </div>
      </form>

      {formMessage ? (
        <p className={`mt-4 rounded-xl border px-4 py-3 text-sm font-semibold ${formError ? "border-rose-200 bg-rose-50 text-rose-700" : "border-cloud-200 bg-white text-slate-700"}`}>
          {formMessage}
        </p>
      ) : null}
    </section>
  );
}
