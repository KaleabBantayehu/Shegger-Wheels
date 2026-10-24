"use client";

import { useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { isPublicCar } from "@/lib/carCatalog";

export default function HomeStats() {
  const { cars } = useApp();

  const stats = useMemo(() => {
    const publicCars = cars.filter(isPublicCar);
    const ratedCars = publicCars.filter((car) => {
      const rating = Number(car.rating);
      return Number.isFinite(rating) && rating > 0;
    });
    const averageRating =
      ratedCars.length > 0
        ? (
            ratedCars.reduce((sum, car) => sum + Number(car.rating), 0) /
            ratedCars.length
          ).toFixed(2)
        : null;

    return [
      {
        value: String(publicCars.length),
        label:
          publicCars.length === 1
            ? "Approved Host Vehicle"
            : "Approved Host Vehicles",
      },
      { value: "100%", label: "Comprehensive Insurance" },
      {
        value: averageRating ? `${averageRating} ★` : "—",
        label: averageRating ? "Average Approved Rating" : "No Ratings Yet",
      },
      { value: "Instant", label: "Instant & Host Sanction" },
    ];
  }, [cars]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-6 max-w-3xl mx-auto">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-gray-900/60 border border-gray-800 p-3 rounded-xl text-left"
        >
          <p className="text-emerald-400 font-extrabold text-lg">{stat.value}</p>
          <p className="text-gray-400 text-[10px]">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
