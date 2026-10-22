import { notFound } from "next/navigation";
import { INITIAL_CARS } from "@/lib/seedData";
import CarDetailClient from "@/components/CarDetailClient";

export async function generateStaticParams() {
  return INITIAL_CARS.map((car) => ({
    id: car.id,
  }));
}

export default async function CarDetailPage({ params }) {
  const resolvedParams = await params;
  const car = INITIAL_CARS.find((c) => c.id === resolvedParams.id);

  if (!car) {
    notFound();
  }

  return <CarDetailClient car={car} />;
}