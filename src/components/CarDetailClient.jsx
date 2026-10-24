"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { calculateBookingDays } from "@/lib/bookingRules";

export default function CarDetailClient({ carId, initialCar }) {
  const router = useRouter();
  const pathname = usePathname();
  const { cars, currentUser, createBooking } = useApp();
  // Use the reactive store after hydration, with the server seed as fallback.
  const car = cars.find((candidate) => candidate.id === carId) || initialCar;
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!car) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-2xl font-extrabold text-white">Vehicle not found</h1>
        <p className="text-sm text-gray-400">
          This listing may have been removed or is no longer available.
        </p>
        <Link
          href="/cars"
          className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition"
        >
          Browse cars
        </Link>
      </div>
    );
  }

  const days = calculateBookingDays(startDate, endDate) || 0;
  const rating = Number(car.rating);
  const hasRating = Number.isFinite(rating) && rating > 0;
  const reviewsCount = Number(car.reviewsCount) || 0;

  const subtotal = car.pricePerDay * days;
  const serviceFee = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + serviceFee;

  const handleBooking = (e) => {
    e.preventDefault();
    setBookingError("");
    if (!currentUser) {
      router.push(`/signin?next=${encodeURIComponent(pathname || `/cars/${carId}`)}`);
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    const result = createBooking({ carId, startDate, endDate });
    setSubmitting(false);
    if (!result.ok) {
      setBookingError(result.error);
      return;
    }
    setBookingSuccess(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-gray-400">
        <Link href="/" className="hover:text-white transition">Home</Link>
        <span>/</span>
        <Link href="/cars" className="hover:text-white transition">Cars</Link>
        <span>/</span>
        <span className="text-gray-200 font-semibold">{car.make} {car.model}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              {car.edition || "Verified Vehicle"}
            </span>
            <span className="text-xs text-gray-400">• {car.year}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
            {car.make} {car.model}
          </h1>
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            📍 {car.neighbourhood}, {car.city}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-gray-400 block">Rating & Reviews</span>
            <span className="text-sm font-bold text-white">
              {hasRating ? (
                <>
                  ★ {rating}{" "}
                  <span className="text-xs text-gray-400">
                    {reviewsCount > 0
                      ? `(${reviewsCount} ${reviewsCount === 1 ? "review" : "reviews"})`
                      : "(No reviews yet)"}
                  </span>
                </>
              ) : (
                <span className="text-xs text-gray-400">No ratings yet</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[350px] md:h-[420px]">
        <div className="md:col-span-2 relative rounded-2xl overflow-hidden border border-gray-800 bg-gray-900">
          <Image
            src={car.photos[0]}
            alt={`${car.make} ${car.model}`}
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="hidden md:flex flex-col gap-4">
          <div className="relative h-1/2 rounded-2xl overflow-hidden border border-gray-800 bg-gray-900">
            <Image
              src={car.photos[0]}
              alt={`${car.make} ${car.model} interior`}
              fill
              className="object-cover brightness-90 hover:brightness-100 transition"
            />
          </div>
          <div className="relative h-1/2 rounded-2xl overflow-hidden border border-gray-800 bg-gray-900 flex items-center justify-center text-xs font-bold text-gray-300">
            <span>+ Photo Gallery</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-[#131d2e] border border-gray-800 rounded-2xl p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="space-y-1">
              <span className="text-gray-400 text-[10px] uppercase font-bold">Transmission</span>
              <p className="text-xs font-bold text-white capitalize">{car.transmission}</p>
            </div>
            <div className="space-y-1">
              <span className="text-gray-400 text-[10px] uppercase font-bold">Seats</span>
              <p className="text-xs font-bold text-white">{car.seats} Seats</p>
            </div>
            <div className="space-y-1">
              <span className="text-gray-400 text-[10px] uppercase font-bold">Fuel Type</span>
              <p className="text-xs font-bold text-white">{car.fuel || "Petrol"}</p>
            </div>
            <div className="space-y-1">
              <span className="text-gray-400 text-[10px] uppercase font-bold">Location</span>
              <p className="text-xs font-bold text-white">{car.neighbourhood}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white">About this Vehicle</h2>
            <p className="text-xs text-gray-300 leading-relaxed">{car.description}</p>
          </div>

          <div className="bg-[#131d2e] border border-gray-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Hosted by</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-800 border-2 border-emerald-500 text-white font-bold text-lg flex items-center justify-center">
                {car.hostName ? car.hostName[0] : "H"}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{car.hostName || "Verified Host"}</h4>
                <p className="text-xs text-gray-400">{car.hostLocation || car.neighbourhood}</p>
              </div>
              {car.isSuperhost && (
                <span className="ml-auto bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-3 py-1 rounded-full">
                  Superhost
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Booking Card */}
        <div className="lg:col-span-5 sticky top-24">
          <div className="bg-[#131d2e] border border-gray-800 rounded-2xl p-6 space-y-6 shadow-xl">
            <div className="flex items-baseline justify-between pb-4 border-b border-gray-800">
              <div>
                <span className="text-2xl font-extrabold text-white">{car.pricePerDay.toLocaleString()}</span>
                <span className="text-xs text-gray-400 font-medium"> ETB / day</span>
              </div>
              <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                Available Now
              </span>
            </div>

            {bookingSuccess ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl space-y-3 text-center">
                <p className="text-emerald-400 font-bold text-sm">🎉 Trip Requested Successfully!</p>
                <p className="text-xs text-gray-300">
                  Your request for {days} day(s) has been sent. You will receive confirmation shortly.
                </p>
                <Link href="/" className="inline-block bg-white text-black font-bold text-xs px-4 py-2 rounded-xl mt-2">
                  Return to Home
                </Link>
              </div>
            ) : (
              <form onSubmit={handleBooking} aria-busy={submitting} className="space-y-4">
                {bookingError && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">{bookingError}</p>}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-900 p-2.5 rounded-xl border border-gray-800">
                    <label htmlFor="booking-start-date" className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Start Date</label>
                    <input
                      id="booking-start-date"
                      name="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-transparent text-xs font-semibold text-white focus:outline-none w-full"
                      required
                    />
                  </div>
                  <div className="bg-gray-900 p-2.5 rounded-xl border border-gray-800">
                    <label htmlFor="booking-end-date" className="text-[10px] font-bold text-gray-400 uppercase block mb-1">End Date</label>
                    <input
                      id="booking-end-date"
                      name="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-transparent text-xs font-semibold text-white focus:outline-none w-full"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2 text-xs text-gray-300 border-t border-gray-800/80">
                  <div className="flex justify-between">
                    <span>{car.pricePerDay.toLocaleString()} ETB × {days} days</span>
                    <span className="font-medium">{subtotal.toLocaleString()} ETB</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Platform Service Fee (5%)</span>
                    <span>{serviceFee.toLocaleString()} ETB</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-800 font-bold text-sm text-white">
                    <span>Total Rate</span>
                    <span className="text-emerald-400">{grandTotal.toLocaleString()} ETB</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl shadow-md transition text-xs"
                >
                  {submitting ? "Submitting…" : currentUser ? "Confirm & Request Trip" : "Sign in to request this trip"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}