export default function EmptyState({ title, description }) {
  return (
    <div className="card-surface p-10 text-center">
      <p className="sky-title text-2xl">{title}</p>
      <p className="mx-auto mt-3 max-w-xl text-slate-600">{description}</p>
    </div>
  );
}
