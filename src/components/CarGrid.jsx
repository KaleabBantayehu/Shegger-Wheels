"use client";

import CarCard from "./CarCard";
import { INITIAL_CARS } from "@/lib/seedData";

export default function CarGrid() {
  // Only render approved cars on the public marketplace
  const approvedCars = INITIAL_CARS.filter((car) => car.status === "approved");

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {approvedCars.map((car) => (
          <CarCard key={car.id} car={car} />
        ))}
      </div>
    </section>
  );
}