"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  CATALOG_CATEGORIES,
  getCatalogLocations,
  isPublicCar,
} from "@/lib/carCatalog";

export default function SearchWidget() {
  const router = useRouter();
  const { cars } = useApp();
  const [location, setLocation] = useState("");
  const [vehicleClass, setVehicleClass] = useState("all");
  const [startDate] = useState("Thu, Oct 24, 10:00");
  const [endDate] = useState("Sun, Oct 27, 13:00");

  const publicCars = cars.filter(isPublicCar);
  const locations = getCatalogLocations(cars);

  const handleSubmit = (event) => {
    event.preventDefault();

    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (vehicleClass !== "all") params.set("category", vehicleClass);

    const query = params.toString();
    router.push(query ? `/cars?${query}` : "/cars");
  };

  return (
    <div className="max-w-6xl mx-auto -mt-10 relative z-20 px-4">
      <form
        onSubmit={handleSubmit}
        role="search"
        aria-label="Search available cars"
        className="bg-white rounded-2xl p-4 shadow-xl border border-gray-100 grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
      >
        {/* Pickup & Dropoff Location */}
        <div className="md:col-span-4 bg-gray-50 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition">
          <label
            htmlFor="home-location"
            className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-1"
          >
            <svg
              className="w-3.5 h-3.5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Pickup & Dropoff Location
          </label>
          <select
            id="home-location"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            className="w-full bg-transparent text-xs font-semibold text-gray-900 focus:outline-none cursor-pointer"
          >
            <option value="">All pickup areas</option>
            {locations.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Trip Schedule Dates */}
        <div className="md:col-span-4 bg-gray-50 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <svg
              className="w-3.5 h-3.5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Trip Schedule (3 Days)
          </span>
          <div className="flex items-center text-xs font-semibold text-gray-900 gap-2">
            <span>{startDate}</span>
            <span className="text-gray-400" aria-hidden="true">
              →
            </span>
            <span>{endDate}</span>
          </div>
        </div>

        {/* Vehicle Class Dropdown */}
        <div className="md:col-span-2 bg-gray-50 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition">
          <label
            htmlFor="home-vehicle-class"
            className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-1"
          >
            <svg
              className="w-3.5 h-3.5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            Vehicle Class
          </label>
          <select
            id="home-vehicle-class"
            value={vehicleClass}
            onChange={(event) => setVehicleClass(event.target.value)}
            className="w-full bg-transparent text-xs font-semibold text-gray-900 focus:outline-none cursor-pointer"
          >
            <option value="all">All vehicle classes</option>
            {CATALOG_CATEGORIES.filter(
              (category) => category.value !== "all",
            ).map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {/* Search CTA Button */}
        <div className="md:col-span-2">
          <button
            type="submit"
            className="w-full bg-[#059669] hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {publicCars.length > 0
              ? `Search ${publicCars.length} cars`
              : "Search cars"}
          </button>
        </div>
      </form>
    </div>
  );
}
