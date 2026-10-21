"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeRole, setActiveRole] = useState("Renter"); // "Renter" | "Car Owner" | "Admin"
  const pathname = usePathname();

  const isActive = (path) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm border-b border-gray-100">
      {/* 1. Top Announcement Bar */}
      <div className="bg-[#0b1320] text-white text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2">
        <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
          Ethiopia
        </span>
        <span>
          Addis Ababa Premier P2P Mobility Fully insured vehicles directly from verified local hosts. Free cancellation up to 24h.
        </span>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-20">
          
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-2">
            <Image
              src="/images/logo.png"
              alt="Sheggar Wheels Logo"
              width={200}
              height={100}
              className="h-9 w-auto object-contain"
              priority
            />
          </Link>

          {/* Quick Location Search Input */}
          <div className="hidden lg:flex items-center bg-gray-100 hover:bg-gray-200/80 transition px-3 py-1.5 rounded-full w-64 border border-gray-200">
            <svg
              className="w-4 h-4 text-gray-500 mr-2 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search Bole, Kazanchis, Airport..."
              className="bg-transparent text-xs text-gray-800 placeholder-gray-500 focus:outline-none w-full"
            />
          </div>

          {/* Nav Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 text-sm font-medium text-gray-700">
            <Link
              href="/cars"
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                isActive('/cars') 
                  ? "bg-black text-white shadow-sm" 
                  : "hover:text-black hover:bg-gray-100 text-gray-700" }`} >
              Explore Cars
            </Link>
            <Link
              href="/howitworks"
             className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                isActive('/cars') 
                  ? "bg-black text-white shadow-sm" 
                  : "hover:text-black hover:bg-gray-100 text-gray-700"
              }`}
            >
              How it Works
            </Link>
            <Link
              href="/list-your-car"
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                isActive('/cars') 
                  ? "bg-black text-white shadow-sm" 
                  : "hover:text-black hover:bg-gray-100 text-gray-700"
              }`} >
              List Your Car
            </Link>
            <Link
              href="/safety"
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                isActive('/cars') 
                  ? "bg-black text-white shadow-sm" 
                  : "hover:text-black hover:bg-gray-100 text-gray-700"
              }`}
            >
              Safety & Insurance
            </Link>
          </nav>

          {/* Right Action Menu: Role Switcher & Profile */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Role Switcher Pill */}
            <div className="flex bg-gray-100 p-1 rounded-full border border-gray-200 text-xs font-semibold text-gray-600">
              {["Renter", "Car Owner", "Admin"].map((role) => (
                <button
                  key={role}
                  onClick={() => setActiveRole(role)}
                  className={`px-3 py-1 rounded-full transition ${
                    activeRole === role
                      ? "bg-white text-black shadow-sm"
                      : "hover:text-black"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            {/* Profile Avatar Placeholder */}
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center border-2 border-white shadow-sm cursor-pointer hover:opacity-90">
              K
            </div>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-black hover:bg-gray-100 focus:outline-none"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

        </div>
      </div>

      {/* 3. Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pt-2 pb-4 space-y-2">
          <Link
            href="/cars"
            className="block px-3 py-2 rounded-md text-base font-semibold bg-black text-white text-center"
            onClick={() => setMobileMenuOpen(false)}
          >
            Explore Cars
          </Link>
          <Link
            href="/howitworks"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(false)}
          >
            How it Works
          </Link>
          <Link
            href="/list-your-car"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(false)}
          >
            List Your Car
          </Link>
          <Link
            href="/safety"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(false)}
          >
            Safety & Insurance
          </Link>

          {/* Role Switcher Mobile */}
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-2 font-medium">Switch View</p>
            <div className="flex bg-gray-100 p-1 rounded-lg text-xs font-semibold justify-around">
              {["Renter", "Car Owner", "Admin"].map((role) => (
                <button
                  key={role}
                  onClick={() => setActiveRole(role)}
                  className={`w-full py-1.5 rounded-md transition ${
                    activeRole === role ? "bg-white text-black shadow-sm" : "text-gray-600"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}