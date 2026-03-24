export default function EmptyState({ title, description, action }) {
  return (
    <div className="card-surface p-6 text-center sm:p-10">
      <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-cloud-100 text-cloud-700 sm:mb-4 sm:h-14 sm:w-14">
        <span className="text-2xl font-black">?</span>
      </div>
      <p className="sky-title text-xl sm:text-2xl">{title}</p>
      <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600 sm:mt-3 sm:text-base">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
