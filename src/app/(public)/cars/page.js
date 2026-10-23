import { Suspense } from "react";
import CarsCatalog from "@/components/CarsCatalog";

export const metadata = {
  title: "Car Catalogue | Sheggar Wheels",
  description:
    "Browse approved rental vehicles in Addis Ababa and filter by location, category, transmission, seats, and daily price.",
};

export default function CarsPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-[#0b1320] min-h-screen flex items-center justify-center px-4">
          <p role="status" className="text-sm text-gray-400">
            Loading car catalogue…
          </p>
        </div>
      }
    >
      <CarsCatalog />
    </Suspense>
  );
}
