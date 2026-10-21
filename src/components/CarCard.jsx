"use client";

import Image from "next/image";
import Link from "next/link";

export default function CarCard({ car }) {
  const rating = car.rating || 4.9;
  const reviewsCount = car.reviewsCount || 12;
  const mainPhoto = car.photos?.[0] || "/images/placeholder.jpg";
  const totalDays = 3;
  const totalPrice = car.pricePerDay * totalDays;

  return (
    <div className="bg-[#131d2e] rounded-2xl border border-gray-800 overflow-hidden shadow-lg flex flex-col justify-between hover:border-gray-700 transition duration-200">
      <div>
        {/* Image Container with Badges */}
        <div className="relative h-48 w-full bg-gray-900">
          <Image
            src={mainPhoto}
            alt={`${car.make} ${car.model}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Top Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 max-w-[80%]">
            {car.tags?.map((tag, idx) => (
              <span
                key={idx}
                className="bg-[#0b1320]/85 backdrop-blur-md text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Favorite Heart Button */}
          <button className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-gray-300 hover:text-red-400 transition border border-white/10">
            ♥
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-3">
          {/* Title and Rating */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-extrabold text-sm text-white leading-snug">
                {car.make} {car.model}
              </h3>
              <p className="text-[11px] text-gray-400 font-medium">
                {car.edition || "Standard"} • {car.year}
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-white bg-gray-800/80 px-2 py-1 rounded-md border border-gray-700 shrink-0">
              <span className="text-amber-400 mr-1">★</span> {rating}
              <span className="text-[10px] text-gray-400 font-normal ml-0.5">
                ({reviewsCount})
              </span>
            </div>
          </div>

          {/* Vehicle Specs Pills */}
          <div className="flex flex-wrap gap-1 text-[10px] font-semibold text-gray-300">
            <span className="bg-gray-800/90 border border-gray-700/60 px-2 py-0.5 rounded capitalize">
              {car.transmission}
            </span>
            <span className="bg-gray-800/90 border border-gray-700/60 px-2 py-0.5 rounded">
              {car.seats} Seats
            </span>
            <span className="bg-gray-800/90 border border-gray-700/60 px-2 py-0.5 rounded">
              {car.fuel || "Petrol"}
            </span>
          </div>

          {/* Host Details */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-800/80">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-800 text-white font-bold text-[10px] flex items-center justify-center border border-emerald-500">
                {car.hostName ? car.hostName[0] : "H"}
              </div>
              <div className="text-[11px] leading-tight">
                <p className="font-bold text-gray-200">{car.hostName || "Verified Host"}</p>
                <p className="text-gray-400 text-[10px]">{car.hostLocation || car.neighbourhood}</p>
              </div>
            </div>

            {car.isSuperhost && (
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold text-[9px] px-2 py-0.5 rounded-full">
                Superhost
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Pricing & CTA Footer */}
      <div className="p-4 pt-2 border-t border-gray-800/80 mt-1 flex items-center justify-between bg-black/20">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-extrabold text-white">
              {car.pricePerDay.toLocaleString()}
            </span>
            <span className="text-[10px] text-gray-400 font-medium">ETB / day</span>
          </div>
          <p className="text-[10px] text-gray-500">
            {totalPrice.toLocaleString()} ETB total • {totalDays} days
          </p>
        </div>

        <button className="bg-white hover:bg-gray-200 text-black font-bold text-xs px-4 py-2 rounded-xl transition shadow-xs">
            <Link
                href={`/cars/${car.id}`}
                className="bg-white hover:bg-gray-200 text-black font-bold text-xs px-4 py-2 rounded-xl transition text-center inline-block"
                >
                {car.tags?.includes("Instant Book") ? "Book Trip" : "Request Trip"}
            </Link>
        </button>
      </div>
    </div>
  );
}