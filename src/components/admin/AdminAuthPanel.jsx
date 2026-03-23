export default function AdminAuthPanel({
  user,
  isAdmin,
  authForm,
  onAuthFormChange,
  onSignIn,
  onSignUp,
  onLogout,
  authMessage,
  authError,
  busy
}) {
  return (
    <section className="card-surface p-6 md:p-7">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-cloud-700">Admin Portal</p>
          <h1 className="sky-title mt-2 text-4xl">Upload and manage inventory</h1>
        </div>
        {user && isAdmin ? (
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

      {!user || !isAdmin ? (
        <form
          className="mt-5 grid gap-3 md:grid-cols-2"
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
            className="rounded-2xl bg-cloud-500 px-5 py-3 text-sm font-bold text-white hover:bg-cloud-700 disabled:opacity-70"
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={onSignUp}
            disabled={busy}
            className="rounded-2xl border border-cloud-200 bg-white px-5 py-3 text-sm font-bold text-cloud-700 hover:border-cloud-400 disabled:opacity-70"
          >
            Sign Up Admin
          </button>
        </form>
      ) : null}
    </section>
  );
}
