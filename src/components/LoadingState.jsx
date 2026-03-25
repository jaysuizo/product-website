export default function LoadingState({ label = "Loading...", kind = "panel", count = 8 }) {
  if (kind === "products") {
    return (
      <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: count }).map((_, index) => (
          <article key={`skeleton-${index}`} className="card-surface overflow-hidden p-0">
            <div className="aspect-[4/3] animate-pulse bg-slate-200" />
            <div className="space-y-2 p-2 sm:space-y-3 sm:p-4">
              <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-full animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-slate-200" />
              <div className="h-10 w-full animate-pulse rounded-xl bg-slate-200" />
            </div>
          </article>
        ))}
      </div>
    );
  }

  return (
    <div className="card-surface grid place-items-center gap-3 p-10 text-center text-cloud-700">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-cloud-200 border-t-cloud-500" />
      <p className="text-sm font-semibold">{label}</p>
    </div>
  );
}
