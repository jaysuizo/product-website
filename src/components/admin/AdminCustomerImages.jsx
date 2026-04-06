export default function AdminCustomerImages({
  customerImages = [],
  draftUrls = "",
  setDraftUrls,
  onSave,
  onDelete,
  busy = false,
  message = "",
  messageIsError = false
}) {
  const draftList = String(draftUrls || "")
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <section className="card-surface p-3 sm:p-6">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2.5 sm:mb-4 sm:gap-3">
        <div>
          <h2 className="sky-title text-xl sm:text-3xl">Customer Photos</h2>
          <p className="mt-1 text-xs text-slate-600 sm:text-sm">
            Add buyer proof photos using image URLs. Unlimited entries.
          </p>
        </div>
        <p className="text-xs font-semibold text-slate-600 sm:text-sm">{customerImages.length} image(s)</p>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSave();
        }}
        className="grid gap-2.5 sm:gap-3"
      >
        <textarea
          value={draftUrls}
          onChange={(event) => setDraftUrls(event.target.value)}
          rows={4}
          placeholder={"Customer image URLs (one per line)\nhttps://...\nhttps://..."}
          className="rounded-2xl border border-cloud-200 bg-white px-3 py-2.5 text-sm focus:border-cloud-500 focus:outline-none"
          required
        />

        {draftList.length > 0 ? (
          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-cloud-200 bg-white p-2 sm:grid-cols-5">
            {draftList.slice(0, 10).map((url) => (
              <img key={url} src={url} alt="Customer preview" className="aspect-square w-full rounded-xl object-cover" loading="lazy" />
            ))}
          </div>
        ) : null}

        <div>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-2xl bg-cloud-500 px-6 py-3 text-sm font-bold text-white hover:bg-cloud-700 disabled:opacity-70 sm:w-auto"
          >
            {busy ? "Saving..." : "Save Customer Photos"}
          </button>
        </div>
      </form>

      {message ? (
        <p
          className={`mt-4 rounded-xl border px-4 py-3 text-sm font-semibold ${
            messageIsError ? "border-rose-200 bg-rose-50 text-rose-700" : "border-cloud-200 bg-white text-slate-700"
          }`}
        >
          {message}
        </p>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-6 sm:grid-cols-3 lg:grid-cols-4">
        {customerImages.map((item) => (
          <article key={item.id} className="overflow-hidden rounded-2xl border border-cloud-200 bg-white">
            <img src={item.image} alt="Customer" className="aspect-square w-full object-cover" loading="lazy" />
            <div className="p-2">
              <button
                type="button"
                onClick={() => onDelete(item)}
                disabled={busy}
                className="w-full rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-70"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
