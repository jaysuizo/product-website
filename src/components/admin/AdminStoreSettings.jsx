export default function AdminStoreSettings({
  settingsForm,
  onSettingsChange,
  onSettingsSubmit,
  settingsMessage,
  settingsError,
  busy
}) {
  return (
    <section className="card-surface p-6">
      <h2 className="sky-title text-3xl">Store Settings</h2>
      <p className="mt-2 text-sm text-slate-600">Centralized editable values for branding and Messenger contact.</p>

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
            className="rounded-2xl border border-cloud-200 bg-white px-4 py-3 text-sm focus:border-cloud-500 focus:outline-none"
          />
          <input
            value={settingsForm.storeTagline}
            onChange={(event) => onSettingsChange("storeTagline", event.target.value)}
            type="text"
            placeholder="Store tagline"
            className="rounded-2xl border border-cloud-200 bg-white px-4 py-3 text-sm focus:border-cloud-500 focus:outline-none"
          />
          <input
            value={settingsForm.storeLogo}
            onChange={(event) => onSettingsChange("storeLogo", event.target.value)}
            type="url"
            placeholder="Store logo URL"
            className="rounded-2xl border border-cloud-200 bg-white px-4 py-3 text-sm focus:border-cloud-500 focus:outline-none"
          />
          <input
            value={settingsForm.messengerLink}
            onChange={(event) => onSettingsChange("messengerLink", event.target.value)}
            type="url"
            placeholder="Messenger link (https://m.me/...)"
            className="rounded-2xl border border-cloud-200 bg-white px-4 py-3 text-sm focus:border-cloud-500 focus:outline-none"
          />
        </div>

        <textarea
          value={settingsForm.contactDetails}
          onChange={(event) => onSettingsChange("contactDetails", event.target.value)}
          rows={3}
          placeholder="Contact details shown in footer"
          className="rounded-2xl border border-cloud-200 bg-white px-4 py-3 text-sm focus:border-cloud-500 focus:outline-none"
        />

        <div>
          <button
            type="submit"
            disabled={busy}
            className="rounded-2xl bg-cloud-500 px-6 py-3 text-sm font-bold text-white hover:bg-cloud-700 disabled:opacity-70"
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
