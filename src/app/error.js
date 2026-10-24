"use client";

import Link from "next/link";

export default function Error({ reset }) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-xs font-bold uppercase tracking-wider text-red-300">Something went wrong</p>
      <h1 className="mt-2 text-2xl font-extrabold text-white">We could not load this page</h1>
      <p className="mt-3 text-sm text-gray-400">
        Please try again, or return to the catalogue if the problem continues.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-600"
        >
          Try again
        </button>
        <Link
          href="/cars"
          className="rounded-xl border border-gray-700 px-4 py-2.5 text-xs font-bold text-gray-300 hover:border-gray-500 hover:text-white"
        >
          Explore cars
        </Link>
      </div>
    </div>
  );
}
