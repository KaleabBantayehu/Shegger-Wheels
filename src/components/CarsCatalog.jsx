"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import CarCard from "./CarCard";
import { useApp } from "@/context/AppContext";
import {
  CATALOG_CATEGORIES,
  CATALOG_SORT_OPTIONS,
  filterAndSortCars,
  getCatalogLocations,
  isPublicCar,
  parseCatalogFilters,
} from "@/lib/carCatalog";

const controlClass =
  "w-full bg-[#0b1320] border border-gray-700 rounded-xl px-3 py-2.5 text-xs font-semibold text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500";
const labelClass =
  "block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5";

export default function CarsCatalog() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { cars } = useApp();

  const queryString = searchParams.toString();
  const filters = useMemo(
    () => parseCatalogFilters(new URLSearchParams(queryString)),
    [queryString],
  );

  const publicCars = useMemo(() => cars.filter(isPublicCar), [cars]);
  const locations = useMemo(() => getCatalogLocations(cars), [cars]);
  const visibleCars = useMemo(
    () => filterAndSortCars(cars, filters),
    [cars, filters],
  );

  const hasFilters =
    Boolean(filters.q) ||
    filters.category !== "all" ||
    filters.location !== "all" ||
    filters.transmission !== "all" ||
    filters.minSeats > 0 ||
    filters.maxPrice > 0 ||
    filters.sort !== "recommended";

  const updateFilter = useCallback(
    (key, rawValue) => {
      const next = new URLSearchParams(searchParams.toString());
      const defaults = {
        q: "",
        category: "all",
        location: "all",
        transmission: "all",
        seats: "0",
        maxPrice: "0",
        sort: "recommended",
      };

      let value = rawValue == null ? "" : String(rawValue).trim();
      if (key === "maxPrice" && Number(value) <= 0) value = "";
      if (key === "seats" && value === "0") value = "";

      if (!value || value === defaults[key]) {
        next.delete(key);
      } else {
        next.set(key, value);
      }

      const nextQuery = next.toString();
      router.push(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  const clearFilters = () => {
    router.push(pathname, { scroll: false });
  };

  const locationIsKnown =
    filters.location === "all" || locations.includes(filters.location);

  return (
    <div className="bg-[#0b1320] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <span className="inline-block bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              Addis Ababa Catalogue
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Find your next ride
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 max-w-2xl">
              Search approved vehicles and narrow the list by area, category,
              transmission, seats, or daily price. Filters stay in the URL so
              you can refresh or use browser navigation without losing them.
            </p>
          </div>

          <Link
            href="/"
            className="text-xs font-semibold text-gray-300 hover:text-white transition"
          >
            ← Back to homepage
          </Link>
        </div>

        <form
          role="search"
          aria-label="Filter available cars"
          className="bg-[#131d2e] border border-gray-800 rounded-2xl p-4 sm:p-5"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label htmlFor="catalog-search" className={labelClass}>
                Search
              </label>
              <input
                id="catalog-search"
                type="search"
                value={filters.q}
                onChange={(event) => updateFilter("q", event.target.value)}
                placeholder="Make, model, fuel, host, or area…"
                autoComplete="off"
                maxLength={120}
                className={controlClass}
              />
            </div>

            <div>
              <label htmlFor="catalog-category" className={labelClass}>
                Category
              </label>
              <select
                id="catalog-category"
                value={filters.category}
                onChange={(event) =>
                  updateFilter("category", event.target.value)
                }
                className={controlClass}
              >
                {CATALOG_CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="catalog-location" className={labelClass}>
                Neighbourhood
              </label>
              <select
                id="catalog-location"
                value={filters.location}
                onChange={(event) =>
                  updateFilter("location", event.target.value)
                }
                className={controlClass}
              >
                <option value="all">All locations</option>
                {!locationIsKnown && (
                  <option value={filters.location}>{filters.location}</option>
                )}
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="catalog-transmission" className={labelClass}>
                Transmission
              </label>
              <select
                id="catalog-transmission"
                value={filters.transmission}
                onChange={(event) =>
                  updateFilter("transmission", event.target.value)
                }
                className={controlClass}
              >
                <option value="all">Any transmission</option>
                <option value="automatic">Automatic</option>
                <option value="manual">Manual</option>
              </select>
            </div>

            <div>
              <label htmlFor="catalog-seats" className={labelClass}>
                Minimum seats
              </label>
              <select
                id="catalog-seats"
                value={filters.minSeats ? String(filters.minSeats) : "0"}
                onChange={(event) => updateFilter("seats", event.target.value)}
                className={controlClass}
              >
                <option value="0">Any seat count</option>
                <option value="4">4+ seats</option>
                <option value="5">5+ seats</option>
                <option value="7">7+ seats</option>
                <option value="12">12+ seats</option>
              </select>
            </div>

            <div>
              <label htmlFor="catalog-max-price" className={labelClass}>
                Maximum daily price (ETB)
              </label>
              <input
                id="catalog-max-price"
                type="number"
                min="0"
                step="500"
                inputMode="numeric"
                value={filters.maxPrice || ""}
                onChange={(event) =>
                  updateFilter("maxPrice", event.target.value)
                }
                placeholder="No limit"
                className={controlClass}
              />
            </div>

            <div>
              <label htmlFor="catalog-sort" className={labelClass}>
                Sort by
              </label>
              <select
                id="catalog-sort"
                value={filters.sort}
                onChange={(event) => updateFilter("sort", event.target.value)}
                className={controlClass}
              >
                {CATALOG_SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p
            role="status"
            aria-live="polite"
            className="text-xs font-semibold text-gray-300"
          >
            Showing{" "}
            <span className="text-emerald-400">{visibleCars.length}</span> of{" "}
            <span className="text-white">{publicCars.length}</span> approved,
            available vehicles
          </p>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-semibold text-gray-300 hover:text-white border border-gray-700 hover:border-gray-600 px-3 py-1.5 rounded-full transition"
            >
              Clear all filters
            </button>
          )}
        </div>

        {visibleCars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleCars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        ) : (
          <div className="bg-[#131d2e] border border-gray-800 rounded-2xl p-10 text-center space-y-4">
            <div className="text-3xl" aria-hidden="true">
              🔍
            </div>
            <h2 className="text-lg font-extrabold text-white">
              No cars match these filters
            </h2>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              Try a different search term or clear some filters. Only approved
              and currently listed vehicles appear in this catalogue.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={clearFilters}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition"
              >
                Clear all filters
              </button>
              <Link
                href="/"
                className="bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-xs px-4 py-2.5 rounded-xl transition"
              >
                Back to homepage
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
