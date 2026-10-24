import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">404</p>
      <h1 className="mt-2 text-2xl font-extrabold text-white">Page not found</h1>
      <p className="mt-3 text-sm text-gray-400">
        The page you requested does not exist or is no longer available.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/" className="rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-600">
          Return home
        </Link>
        <Link href="/cars" className="rounded-xl border border-gray-700 px-4 py-2.5 text-xs font-bold text-gray-300 hover:border-gray-500 hover:text-white">
          Explore cars
        </Link>
      </div>
    </div>
  );
}
