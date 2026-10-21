import Hero from "@/components/Hero";
import FilterBar from "@/components/FilterBar";
import CarGrid from "@/components/CarGrid";
import LocationMapSection from "@/components/LocationMapSection";
import TrustFeatures from "@/components/TrustFeatures";

export default function Home() {
  return (
    <div className="bg-white space-y-6 pb-12">
      <Hero />
      <FilterBar />
      <CarGrid />
      <LocationMapSection />
      <TrustFeatures />
    </div>
  );
}