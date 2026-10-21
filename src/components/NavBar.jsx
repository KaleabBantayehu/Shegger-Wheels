// src/components/Navbar.jsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const pathname = usePathname();

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
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-2">
            <span className="text-white font-extrabold text-lg tracking-tight">
              Sheggar<span className="text-emerald-400">Wheels</span>
            </span>
          </Link>

          {/* Quick Search Input */}
          <div className="hidden lg:flex items-center bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-full w-64">
            <svg className="w-4 h-4 text-gray-400 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search Bole, Kazanchis, Airport..."
              className="bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none w-full"
            />
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 text-xs font-medium text-gray-300">
            <Link
              href="/cars"
              className={`px-3 py-1.5 rounded-full transition ${
                pathname === "/cars" ? "bg-white text-black font-bold" : "hover:text-white hover:bg-gray-800"
              }`}
            >
              Explore Cars
            </Link>
            <Link
              href="/howitworks"
              className="hover:text-white hover:bg-gray-800 px-3 py-1.5 rounded-full transition"
            >
              How it Works
            </Link>
            <Link
              href="/host/dashboard"
              className="hover:text-white hover:bg-gray-800 px-3 py-1.5 rounded-full transition"
            >
              List Your Car
            </Link>
          </nav>

          {/* Role Switcher Navigation Pills */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex bg-gray-900 p-1 rounded-full border border-gray-800 text-xs font-semibold">
              <Link
                href="/"
                className={`px-3 py-1 rounded-full transition ${
                  !pathname.startsWith("/host") && !pathname.startsWith("/admin")
                    ? "bg-white text-black shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Renter
              </Link>
              <Link
                href="/host/dashboard"
                className={`px-3 py-1 rounded-full transition ${
                  pathname.startsWith("/host")
                    ? "bg-white text-black shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Car Owner
              </Link>
              <Link
                href="/admin/console"
                className={`px-3 py-1 rounded-full transition ${
                  pathname.startsWith("/admin")
                    ? "bg-white text-black shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Admin
              </Link>
            </div>

            {/* Profile Avatar Placeholder */}
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center border-2 border-emerald-400 cursor-pointer">
              K
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}