// src/components/Navbar.jsx
"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { hasRole } from "@/lib/auth";

function navLinkClass(isActive) {
  return `px-3 py-1.5 rounded-full transition ${
    isActive
      ? "bg-white text-black font-bold"
      : "hover:text-white hover:bg-gray-800"
  }`;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { hydrated, currentUser, signOutUser, becomeOwner } = useApp();
  const [quickSearch, setQuickSearch] = useState("");

  const isOwner = hasRole(currentUser, "owner");
  const isRenter = hasRole(currentUser, "renter");
  const isAdmin = hasRole(currentUser, "admin");
  const isOwnerPage = pathname.startsWith("/host");
  const isAdminPage = pathname.startsWith("/admin");
  const signInHref =
    isOwnerPage || isAdminPage
      ? `/signin?next=${encodeURIComponent(pathname)}`
      : "/signin";

  const handleQuickSearch = (event) => {
    event.preventDefault();
    const query = quickSearch.trim();
    router.push(query ? `/cars?q=${encodeURIComponent(query)}` : "/cars");
  };

  const handleSignOut = () => {
    signOutUser();
    // A full navigation guarantees the sign-out returns to the homepage and
    // cannot be overtaken by a protected-page guard redirect.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign("/");
  };

  const displayName = currentUser?.name || "";
  const initial = displayName.trim().charAt(0).toUpperCase() || "?";
  const roleLabel = currentUser?.roles?.join(" · ") || "";

  const handleBecomeOwner = () => {
    const result = becomeOwner();
    if (!result.ok) {
      window.alert(result.error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0b1320] border-b border-gray-800">
      {/* Announcement Bar */}
      <div className="bg-[#070c14] text-gray-300 text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2 border-b border-gray-800/60">
        <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
          Ethiopia
        </span>
        <span>
          Addis Ababa Premier P2P Mobility — Fully insured vehicles directly from verified local hosts.
        </span>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-2">
            <span className="text-white font-extrabold text-lg tracking-tight">
              Sheggar<span className="text-emerald-400">Wheels</span>
            </span>
          </Link>

          {/* Quick Search Input */}
          <form
            onSubmit={handleQuickSearch}
            role="search"
            className="hidden lg:flex items-center bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-full w-64"
          >
            <button
              type="submit"
              aria-label="Search cars"
              className="text-gray-400 hover:text-emerald-400 transition mr-2 shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <input
              type="search"
              value={quickSearch}
              onChange={(event) => setQuickSearch(event.target.value)}
              aria-label="Search cars by make, model, or location"
              placeholder="Search make, model, or area..."
              className="bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none w-full"
            />
          </form>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 text-xs font-medium text-gray-300">
            <Link
              href="/cars"
              className={navLinkClass(pathname.startsWith("/cars"))}
            >
              Explore Cars
            </Link>

            {hydrated && isOwner && (
              <Link
                href="/host/dashboard"
                className={navLinkClass(isOwnerPage)}
              >
                Owner Dashboard
              </Link>
            )}

            {hydrated && isRenter && (
              <Link href="/bookings" className={navLinkClass(pathname.startsWith("/bookings"))}>
                My Bookings
              </Link>
            )}

            {hydrated && isAdmin && (
              <Link
                href="/admin/console"
                className={navLinkClass(isAdminPage)}
              >
                Admin Console
              </Link>
            )}
          </nav>

          {/* Account Area */}
          <div className="flex items-center gap-2 sm:gap-3">
            {!hydrated ? (
              <div
                aria-hidden="true"
                className="h-8 w-24 rounded-full bg-gray-800/70 animate-pulse"
              />
            ) : currentUser ? (
              <>
                <div className="hidden sm:block text-right max-w-[170px]">
                  <p className="text-[11px] font-bold text-white truncate">
                    {currentUser.name}
                  </p>
                  <p className="text-[9px] uppercase tracking-wide text-emerald-400 truncate">
                    {roleLabel}
                  </p>
                </div>

                <div
                  className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center border-2 border-emerald-400"
                  title={currentUser.name}
                >
                  {initial}
                </div>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="text-[11px] font-semibold text-gray-300 hover:text-white border border-gray-700 hover:border-gray-600 px-2.5 py-1.5 rounded-full transition"
                >
                  Sign out
                </button>
                {isRenter && !isOwner && !isAdmin && (
                  <button
                    type="button"
                    onClick={handleBecomeOwner}
                    className="hidden lg:inline text-[10px] font-semibold text-emerald-300 hover:text-white border border-emerald-500/40 px-2 py-1.5 rounded-full transition"
                  >
                    Become an owner
                  </button>
                )}
              </>
            ) : (
              <Link
                href={signInHref}
                className="bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold px-3.5 py-2 rounded-full transition"
              >
                Sign in
              </Link>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
