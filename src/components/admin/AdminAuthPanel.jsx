export default function AdminAuthPanel({
  user,
  isAdmin,
  authForm,
  onAuthFormChange,
  onSignIn,
  onLogout,
  onGoHome,
  authMessage,
  authError,
  busy
}) {
  const isSignedInNonAdmin = Boolean(user) && !isAdmin;

  return (
    <section className="card-surface p-4 sm:p-6 md:p-7">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3 sm:mb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-cloud-700">Admin Portal</p>
          <h1 className="sky-title mt-2 text-2xl sm:text-4xl">Inventory Management</h1>
        </div>
        {user ? (
          <button
            type="button"
            onClick={onLogout}
            className="rounded-2xl border border-cloud-200 bg-white px-4 py-2 text-sm font-bold text-cloud-700 hover:border-cloud-400"
          >
            Log out
          </button>
        ) : null}
      </div>

      <p className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
        authError
          ? "border-rose-200 bg-rose-50 text-rose-700"
          : "border-cloud-200 bg-white text-slate-600"
      }`}>
        {authError || authMessage}
      </p>

      {!user ? (
        <form
          className="mt-4 grid gap-3 md:mt-5 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            onSignIn();
          }}
        >
          <input
            value={authForm.email}
            onChange={(event) => onAuthFormChange("email", event.target.value)}
            type="email"
            placeholder="Admin email"
            className="rounded-2xl border border-cloud-200 bg-white px-4 py-3 text-sm focus:border-cloud-500 focus:outline-none"
            required
          />
          <input
            value={authForm.password}
            onChange={(event) => onAuthFormChange("password", event.target.value)}
            type="password"
            placeholder="Password"
            className="rounded-2xl border border-cloud-200 bg-white px-4 py-3 text-sm focus:border-cloud-500 focus:outline-none"
            required
            minLength={6}
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-2xl bg-cloud-500 px-5 py-3 text-sm font-bold text-white hover:bg-cloud-700 disabled:opacity-70 md:col-span-2 md:mx-auto md:w-72"
          >
            Sign In
          </button>
        </form>
      ) : null}

      {isSignedInNonAdmin ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onGoHome}
            className="rounded-xl border border-cloud-200 bg-white px-4 py-2 text-sm font-bold text-cloud-700 hover:border-cloud-400"
          >
            Go to Home
          </button>
        </div>
      ) : null}
    </section>
  );
}
