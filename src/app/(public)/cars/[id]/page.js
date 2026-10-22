import { INITIAL_CARS } from "@/lib/seedData";
import CarDetailClient from "@/components/CarDetailClient";

export async function generateStaticParams() {
  return INITIAL_CARS.map((car) => ({
    id: car.id,
  }));
}

export default async function CarDetailPage({ params }) {
  const resolvedParams = await params;
  // The seed car is only the server-rendered first value. After hydration,
  // CarDetailClient reads the live vehicle collection from AppContext, so
  // persisted owner-created cars can also be displayed.
  const initialCar =
    INITIAL_CARS.find((c) => c.id === resolvedParams.id) || null;

  return <CarDetailClient carId={resolvedParams.id} initialCar={initialCar} />;
}
