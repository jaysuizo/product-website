import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <section className="card-surface p-10 text-center">
      <h1 className="sky-title text-4xl">Page not found</h1>
      <p className="mx-auto mt-4 max-w-lg text-slate-600">
        The page you opened does not exist in this product showcase.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex rounded-2xl bg-cloud-500 px-6 py-3 text-sm font-bold text-white hover:bg-cloud-700"
      >
        Back to Home
      </Link>
    </section>
  );
}
