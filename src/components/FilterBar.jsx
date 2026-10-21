"use client";

import { useState } from "react";

export default function FilterBar() {
  const [activeCategory, setActiveCategory] = useState("All Vehicles");

  const categories = [
    { name: "All Vehicles", count: 142 },
    { name: "4x4 & SUVs", count: 48 },
    { name: "Executive Sedans", count: 32 },
    { name: "Economical", count: 38 },
    { name: "Electric & Hybrids", count: 14 },
    { name: "Chauffeur Available", count: 31 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-4">
      {/* Category Pills Header */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setActiveCategory(cat.name)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              activeCategory === cat.name
                ? "bg-black text-white shadow-sm"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            {cat.name} <span className="opacity-60 font-normal">({cat.count})</span>
          </button>
        ))}
      </div>

      {/* secondary Filters Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-gray-600 border-t border-gray-200/60">
        <div className="flex flex-wrap items-center gap-2">
          {/* Price Selector */}
          <select className="bg-white border border-gray-200 rounded-full px-3 py-1.5 font-medium hover:border-gray-300 focus:outline-none">
            <option>Price: Up to 14,000 ETB/day</option>
            <option>Price: Up to 8,000 ETB/day</option>
            <option>Price: Up to 5,000 ETB/day</option>
          </select>

          {/* Transmission Toggle Group */}
          <div className="flex bg-white border border-gray-200 rounded-full p-0.5 font-medium">
            <button className="px-3 py-1 rounded-full bg-gray-100 text-black font-semibold">All</button>
            <button className="px-3 py-1 rounded-full hover:text-black">Auto</button>
            <button className="px-3 py-1 rounded-full hover:text-black">Manual</button>
          </div>

          {/* Quick Filters */}
          <button className="bg-white border border-gray-200 rounded-full px-3 py-1.5 font-medium hover:bg-gray-50 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Instant Book Only
          </button>
          <button className="bg-white border border-gray-200 rounded-full px-3 py-1.5 font-medium hover:bg-gray-50">
            Diesel
          </button>
        </div>

        {/* Right Sort Controls */}
        <div className="flex items-center gap-3">
          <span className="text-gray-400 font-medium">6 vehicles in Addis</span>
          <select className="bg-white border border-gray-200 rounded-full px-3 py-1.5 font-medium hover:border-gray-300 focus:outline-none">
            <option>Sort: Recommended</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Highest Rated</option>
          </select>
        </div>
      </div>
    </div>
  );
}