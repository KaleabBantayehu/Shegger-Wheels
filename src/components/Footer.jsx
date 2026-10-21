"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  const [currency, setCurrency] = useState("ETB");

  return (
    <footer className="bg-[#0b1320] text-gray-400 text-xs border-t border-gray-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Top Grid Sections */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Column 1: Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              <span className="text-white font-bold text-base tracking-wide">
                SheggarWheels
              </span>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed">
              Ethiopia&#39;s trusted peer-to-peer vehicle sharing marketplace. Connecting verified vehicle owners with vetted drivers for daily, weekly, or corporate rentals across Addis Ababa and beyond.
            </p>
            <div className="flex flex-col gap-1.5 pt-2">
              <div className="flex items-center gap-2 text-[11px] text-gray-300">
                <span className="text-emerald-400">✓</span> Best Price Guarantee
              </div>
              <div className="flex items-center gap-2 text-[11px] text-gray-300">
                <span className="text-emerald-400">✓</span> 24/7 Roadside Assist
              </div>
            </div>
          </div>

          {/* Column 2: Addis Coverage */}
          <div>
            <h4 className="text-white font-semibold mb-3 tracking-wider text-[11px] uppercase">
              Addis Coverage
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/locations/bole" className="hover:text-white transition">
                  Bole Intl Airport & Hubs
                </Link>
              </li>
              <li>
                <Link href="/locations/kazanchis" className="hover:text-white transition">
                  Kazanchis Business District
                </Link>
              </li>
              <li>
                <Link href="/locations/piassa" className="hover:text-white transition">
                  Piassa & Arada Heritage Area
                </Link>
              </li>
              <li>
                <Link href="/locations/cmc" className="hover:text-white transition">
                  CMC & Ayat Residential
                </Link>
              </li>
              <li>
                <Link href="/locations/sarbet" className="hover:text-white transition">
                  Sarbet & Vatican Embassy Area
                </Link>
              </li>
              <li>
                <Link href="/locations/old-airport" className="hover:text-white transition">
                  Old Airport (Bisrate Gabriel)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Community */}
          <div>
            <h4 className="text-white font-semibold mb-3 tracking-wider text-[11px] uppercase">
              Community
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/how-peer-rental-works" className="hover:text-white transition">
                  How Peer Rental Works
                </Link>
              </li>
              <li>
                <Link href="/list-your-vehicle" className="hover:text-white transition">
                  List Your Vehicle
                </Link>
              </li>
              <li>
                <Link href="/revenue-calculator" className="hover:text-white transition">
                  Host Revenue Calculator
                </Link>
              </li>
              <li>
                <Link href="/insurance" className="hover:text-white transition">
                  Insurance & Protection
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition">
                  Help Center & FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Currency & Pay */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold mb-3 tracking-wider text-[11px] uppercase">
              Currency & Pay
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Local payment integrations verified by National Bank of Ethiopia regulations.
            </p>
            
            {/* Payment Method Badges */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="bg-gray-800 text-gray-300 text-[10px] font-semibold px-2 py-1 rounded border border-gray-700">
                Telebirr
              </span>
              <span className="bg-gray-800 text-gray-300 text-[10px] font-semibold px-2 py-1 rounded border border-gray-700">
                CBE Birr
              </span>
              <span className="bg-gray-800 text-gray-300 text-[10px] font-semibold px-2 py-1 rounded border border-gray-700">
                Visa/MC
              </span>
            </div>

            {/* Display Currency Switcher */}
            <div className="pt-2">
              <span className="text-[11px] text-gray-400 block mb-1">Display:</span>
              <div className="inline-flex bg-gray-900 p-1 rounded-lg border border-gray-800 text-xs">
                <button
                  onClick={() => setCurrency("ETB")}
                  className={`px-3 py-1 rounded font-bold transition ${
                    currency === "ETB"
                      ? "bg-black text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  ETB (Br)
                </button>
                <button
                  onClick={() => setCurrency("USD")}
                  className={`px-3 py-1 rounded font-bold transition ${
                    currency === "USD"
                      ? "bg-black text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  USD ($)
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="border-t border-gray-800/60 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-gray-500">
          <p>© 2026 Sheggar Wheels Technologies PLC. All rights reserved. Addis Ababa, Ethiopia</p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-gray-300 transition">
              Rental Terms
            </Link>
            <Link href="/privacy" className="hover:text-gray-300 transition">
              Privacy Policy
            </Link>
            <Link href="/host-agreement" className="hover:text-gray-300 transition">
              Host Agreement
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}