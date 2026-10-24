"use client";

import dynamic from "next/dynamic";
import { useApp } from "@/context/AppContext";
import { isPublicCar } from "@/lib/carCatalog";

// Dynamically import map without server-side rendering
const Map = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[300px] bg-gray-900 animate-pulse rounded-xl flex items-center justify-center text-xs text-gray-500">
      Loading Addis Ababa Map...
    </div>
  ),
});

export default function LocationMapSection() {
  const { cars } = useApp();
  const publicCars = cars.filter(isPublicCar);

  const hubs = [
    {
      name: "Bole Sub-City",
      matches: (car) => car.neighbourhood?.toLowerCase().includes("bole"),
      description: "Airport, Edna Mall, Atlas Hotel area. Ideal for international arrivals and diplomats.",
    },
    {
      name: "Kazanchis & Kirkos",
      matches: (car) => car.neighbourhood?.toLowerCase().includes("kazanchis"),
      description: "UNECA, Hilton, Sheraton & Minitrue district. Executive sedans and chauffeur-ready.",
    },
    {
      name: "Piassa & Arada",
      matches: (car) => car.neighbourhood?.toLowerCase().includes("piassa"),
      description: "Historical centre, Arat Kilo, and University district. Great economy car pricing.",
    },
  ].map((hub) => {
    const count = publicCars.filter(hub.matches).length;
    return {
      ...hub,
      countLabel: `${count} ${count === 1 ? "Vehicle" : "Vehicles"}`,
    };
  });

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Section Header */}
      <div className="mb-6">
        <p className="text-emerald-400 font-bold text-xs uppercase tracking-wider">
          Geographic Coverage
        </p>
        <h2 className="text-2xl font-extrabold text-white">
          Addis Ababa Pickup & Key Hubs
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Hosts deliver anywhere within the Greater Addis ring road, including express VVIP terminal handoffs at Bole International Airport.
        </p>
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column: Interactive Real React-Leaflet Map */}
        <div className="lg:col-span-7 bg-[#131d2e] border border-gray-800 rounded-2xl p-3 flex flex-col justify-between relative overflow-hidden min-h-[340px]">
          <Map cars={publicCars} />
        </div>

        {/* Right Column: Sub-city Cards List */}
        <div className="lg:col-span-5 space-y-3">
          {hubs.map((hub, idx) => (
            <div
              key={idx}
              className="bg-[#131d2e] border border-gray-800 hover:border-gray-700 transition p-4 rounded-2xl flex items-start justify-between gap-4"
            >
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">{hub.name}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {hub.description}
                </p>
              </div>
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-emerald-500/30 shrink-0">
                {hub.countLabel}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}