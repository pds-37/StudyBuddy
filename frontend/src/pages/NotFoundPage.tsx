import { Link } from "react-router-dom";

/** Shows a simple fallback for unknown routes. */
export function NotFoundPage() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-24 text-center">
      <p className="text-sm uppercase tracking-[0.4em] text-slate-500">404</p>
      <h1 className="mt-4 text-3xl font-semibold">Page not found</h1>
      <Link to="/" className="mt-6 inline-flex text-sm text-cyan hover:text-slate-900 dark:text-slate-900 dark:text-white">
        Return home
      </Link>
    </section>
  );
}
