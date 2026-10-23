"use client";

import CarCard from "./CarCard";
import { useApp } from "@/context/AppContext";
import { isPublicCar } from "@/lib/carCatalog";

export default function CarGrid() {
  const { cars } = useApp();
  // Use the same public-listing rule as the /cars catalogue.
  const approvedCars = cars.filter(isPublicCar);

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