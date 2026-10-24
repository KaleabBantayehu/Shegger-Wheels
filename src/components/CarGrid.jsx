"use client";

import Link from "next/link";
import CarCard from "./CarCard";
import { useApp } from "@/context/AppContext";
import { isPublicCar } from "@/lib/carCatalog";

export default function CarGrid() {
  const { cars } = useApp();
  // Use the same public-listing rule as the /cars catalogue.
  const approvedCars = cars.filter(isPublicCar);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8">
      {approvedCars.length === 0 ? (
        <div className="bg-[#131d2e] border border-gray-800 rounded-2xl p-10 text-center space-y-3">
          <h2 className="text-lg font-extrabold text-white">
            No approved vehicles available
          </h2>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            New listings will appear here after an administrator reviews and
            approves them.
          </p>
          <Link
            href="/cars"
            className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition"
          >
            Browse the catalogue
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {approvedCars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      )}
    </section>
  );
}