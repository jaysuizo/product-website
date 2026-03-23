import { formatTimestamp } from "../../lib/format";

export default function AdminInventoryLogs({ logs }) {
  return (
    <section className="card-surface p-6">
      <h2 className="sky-title text-3xl">Inventory Logs</h2>
      <p className="mt-2 text-sm text-slate-600">Recent inventory actions from admin users.</p>

      {logs.length === 0 ? (
        <p className="mt-5 rounded-2xl border border-cloud-200 bg-white p-4 text-sm text-slate-600">
          No logs yet.
        </p>
      ) : (
        <ul className="mt-5 grid gap-3">
          {logs.map((log) => (
            <li key={log.id} className="rounded-2xl border border-cloud-200 bg-white p-4 text-sm text-slate-700">
              <p className="font-bold text-cloud-800">{String(log.action || "updated").toUpperCase()} - {log.productName}</p>
              <p className="mt-1 text-slate-600">
                Stock {Number(log.previousStock || 0)} to {Number(log.currentStock || 0)}
              </p>
              <p className="mt-1 text-slate-500">{log.adminEmail || "unknown"} - {formatTimestamp(log.createdAt)}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
