export default function LoadingState({ label = "Loading..." }) {
  return (
    <div className="card-surface grid place-items-center gap-3 p-10 text-center text-cloud-700">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-cloud-200 border-t-cloud-500" />
      <p className="text-sm font-semibold">{label}</p>
    </div>
  );
}
