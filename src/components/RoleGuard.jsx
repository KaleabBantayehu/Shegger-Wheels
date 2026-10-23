"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { hasRole } from "@/lib/auth";

const ROLE_LABELS = {
  owner: "owner",
  admin: "administrator",
};

/**
 * Application-level route guard.
 *
 * Middleware cannot read sessionStorage, so this guard runs in the browser
 * after AppProvider hydrates the demo session.
 */
export default function RoleGuard({ role, children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { hydrated, currentUser, signOutUser } = useApp();
  const isAllowed = Boolean(currentUser && hasRole(currentUser, role));

  useEffect(() => {
    if (!hydrated || currentUser) return;

    // A short delay lets an intentional sign-out navigate away first. If the
    // visitor is still on a protected URL, the redirect proceeds normally.
    const timeout = window.setTimeout(() => {
      const next = encodeURIComponent(pathname || "/");
      router.replace(`/signin?next=${next}`);
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [currentUser, hydrated, pathname, router]);

  if (!hydrated) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p role="status" className="text-sm text-gray-400">
          Checking your account access…
        </p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-3">
        <p role="status" className="text-sm text-gray-400">
          Redirecting you to demo sign-in…
        </p>
        <Link
          href={`/signin?next=${encodeURIComponent(pathname || "/")}`}
          className="inline-block text-xs font-semibold text-emerald-400 hover:text-emerald-300"
        >
          Continue to sign-in
        </Link>
      </div>
    );
  }

  if (!isAllowed) {
    const handleSwitchAccount = () => {
      signOutUser();
      router.replace(`/signin?next=${encodeURIComponent(pathname || "/")}`);
    };

    return (
      <div className="max-w-2xl mx-auto px-4 py-20">
        <div className="bg-[#131d2e] border border-red-500/30 rounded-2xl p-8 text-center space-y-4">
          <span className="inline-block bg-red-500/10 text-red-300 border border-red-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
            Access Denied
          </span>
          <h1 className="text-2xl font-extrabold text-white">
            This page is restricted
          </h1>
          <p className="text-sm text-gray-400">
            You are signed in as{" "}
            <strong className="text-gray-200">{currentUser.name}</strong>, but
            this page requires the{" "}
            <strong className="text-gray-200">
              {ROLE_LABELS[role] || role}
            </strong>{" "}
            role.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/cars"
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition"
            >
              Browse cars
            </Link>
            <button
              type="button"
              onClick={handleSwitchAccount}
              className="bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-xs px-4 py-2.5 rounded-xl transition"
            >
              Switch demo account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
