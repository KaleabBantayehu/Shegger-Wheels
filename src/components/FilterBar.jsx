"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  CATALOG_CATEGORIES,
  CATALOG_SORT_OPTIONS,
  getCategoryCounts,
  isPublicCar,
} from "@/lib/carCatalog";

export default function FilterBar() {
  const router = useRouter();
  const { cars } = useApp();
  const publicCars = useMemo(() => cars.filter(isPublicCar), [cars]);
  const counts = useMemo(() => getCategoryCounts(cars), [cars]);

  const goToCatalog = (query = "") => {
    router.push(query ? `/cars?${query}` : "/cars");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-4">
      {/* Category Pills Header */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATALOG_CATEGORIES.map((category) => (
          <Link
            key={category.value}
            href={
              category.value === "all"
                ? "/cars"
                : `/cars?category=${encodeURIComponent(category.value)}`
            }
            className="px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
          >
            {category.label}{" "}
            <span className="opacity-60 font-normal">
              ({counts[category.value] || 0})
            </span>
          </Link>
        ))}
      </div>

      {/* Secondary Filters Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-gray-600 border-t border-gray-200/60">
        <div className="flex flex-wrap items-center gap-2">
          {/* Price Selector */}
          <label htmlFor="home-max-price" className="sr-only">
            Maximum daily price
          </label>
          <select
            id="home-max-price"
            defaultValue=""
            onChange={(event) => {
              const value = event.target.value;
              goToCatalog(value ? `maxPrice=${encodeURIComponent(value)}` : "");
            }}
            className="bg-white border border-gray-200 rounded-full px-3 py-1.5 font-medium hover:border-gray-300 focus:outline-none"
          >
            <option value="">Price: Any daily rate</option>
            <option value="14000">Price: Up to 14,000 ETB/day</option>
            <option value="8000">Price: Up to 8,000 ETB/day</option>
            <option value="5000">Price: Up to 5,000 ETB/day</option>
          </select>

          {/* Transmission Toggle Group */}
          <div className="flex bg-white border border-gray-200 rounded-full p-0.5 font-medium">
            <Link
              href="/cars"
              className="px-3 py-1 rounded-full hover:bg-gray-100 hover:text-black"
            >
              All
            </Link>
            <Link
              href="/cars?transmission=automatic"
              className="px-3 py-1 rounded-full hover:bg-gray-100 hover:text-black"
            >
              Auto
            </Link>
            <Link
              href="/cars?transmission=manual"
              className="px-3 py-1 rounded-full hover:bg-gray-100 hover:text-black"
            >
              Manual
            </Link>
          </div>

          {/* Quick Filters */}
          <Link
            href="/cars?q=Instant%20Book"
            className="bg-white border border-gray-200 rounded-full px-3 py-1.5 font-medium hover:bg-gray-50 flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Instant Book Only
          </Link>
          <Link
            href="/cars?q=Diesel"
            className="bg-white border border-gray-200 rounded-full px-3 py-1.5 font-medium hover:bg-gray-50"
          >
            Diesel
          </Link>
        </div>

        {/* Right Sort Controls */}
        <div className="flex items-center gap-3">
          <span className="text-gray-400 font-medium">
            {publicCars.length} approved vehicles in Addis
          </span>
          <label htmlFor="home-sort" className="sr-only">
            Sort vehicles
          </label>
          <select
            id="home-sort"
            defaultValue="recommended"
            onChange={(event) => {
              const value = event.target.value;
              goToCatalog(
                value === "recommended"
                  ? ""
                  : `sort=${encodeURIComponent(value)}`,
              );
            }}
            className="bg-white border border-gray-200 rounded-full px-3 py-1.5 font-medium hover:border-gray-300 focus:outline-none"
          >
            {CATALOG_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                Sort: {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
