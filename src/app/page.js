import Hero from "@/components/Hero";
import FilterBar from "@/components/FilterBar";
import CarGrid from "@/components/CarGrid";

export default function Home() {
  return (
    <div className="bg-white space-y-4 pb-16">
      <Hero />
      <FilterBar />
      <CarGrid />
    </div>
  );
}