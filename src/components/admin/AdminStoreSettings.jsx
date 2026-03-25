export default function AdminStoreSettings({
  settingsForm,
  onSettingsChange,
  onSettingsSubmit,
  settingsMessage,
  settingsError,
  busy
}) {
  return (
    <section className="card-surface p-4 sm:p-6">
      <h2 className="sky-title text-xl sm:text-3xl">Store Settings</h2>
      <p className="mt-2 text-xs text-slate-600 sm:text-sm">Centralized editable values for branding and Messenger contact.</p>

      <form
        className="mt-5 grid gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          onSettingsSubmit();
        }}
      >
        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={settingsForm.storeName}
            onChange={(event) => onSettingsChange("storeName", event.target.value)}
            type="text"
            placeholder="Store name"
            className="rounded-2xl border border-cloud-200 bg-white px-3.5 py-3 text-sm focus:border-cloud-500 focus:outline-none sm:px-4"
          />
          <input
            value={settingsForm.storeTagline}
            onChange={(event) => onSettingsChange("storeTagline", event.target.value)}
            type="text"
            placeholder="Store tagline"
            className="rounded-2xl border border-cloud-200 bg-white px-3.5 py-3 text-sm focus:border-cloud-500 focus:outline-none sm:px-4"
          />
        </div>

        <div className="rounded-2xl border border-cloud-200 bg-white p-3.5 sm:p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-cloud-700">Store Logo URL</p>
          <p className="mt-1 text-xs text-slate-500">Use external image URL for Spark plan compatibility.</p>
          <input
            type="url"
            value={settingsForm.storeLogo}
            onChange={(event) => onSettingsChange("storeLogo", event.target.value)}
            placeholder="https://.../logo.png"
            className="mt-3 w-full rounded-xl border border-cloud-200 bg-white px-3.5 py-3 text-sm focus:border-cloud-500 focus:outline-none sm:px-4"
          />
          {settingsForm.storeLogo ? (
            <img
              src={settingsForm.storeLogo}
              alt="Store logo"
              className="mt-3 h-20 w-20 rounded-xl border border-cloud-100 object-cover"
            />
          ) : null}
        </div>

        <textarea
          value={settingsForm.contactDetails}
          onChange={(event) => onSettingsChange("contactDetails", event.target.value)}
          rows={3}
          placeholder="Contact details shown in footer"
          className="rounded-2xl border border-cloud-200 bg-white px-3.5 py-3 text-sm focus:border-cloud-500 focus:outline-none sm:px-4"
        />

        <div>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-2xl bg-cloud-500 px-6 py-3 text-sm font-bold text-white hover:bg-cloud-700 disabled:opacity-70 sm:w-auto"
          >
            Save settings
          </button>
        </div>
      </form>

      {settingsMessage ? (
        <p className={`mt-4 rounded-xl border px-4 py-3 text-sm font-semibold ${settingsError ? "border-rose-200 bg-rose-50 text-rose-700" : "border-cloud-200 bg-white text-slate-700"}`}>
          {settingsMessage}
        </p>
      ) : null}
    </section>
  );
}
