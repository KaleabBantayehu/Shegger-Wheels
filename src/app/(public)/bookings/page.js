"use client";

import Link from "next/link";
import RoleGuard from "@/components/RoleGuard";
import { useApp } from "@/context/AppContext";

function BookingHistory() {
  const { bookings, currentUser, cars, becomeOwner } = useApp();
  const ownBookings = bookings.filter((booking) => booking.renterId === currentUser?.id);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-extrabold text-white">My bookings</h1>
      <div className="mt-6 space-y-3">
        {ownBookings.length === 0 && (
          <div className="rounded-2xl border border-gray-800 bg-[#131d2e] p-8 text-center space-y-2">
            <h2 className="text-lg font-extrabold text-white">
              No bookings yet
            </h2>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              Trips you request from an approved vehicle will appear here.
            </p>
          </div>
        )}
        {ownBookings.map((booking) => {
          const car = cars.find((candidate) => candidate.id === booking.carId);
          return (
            <article key={booking.id} className="rounded-2xl border border-gray-800 bg-[#131d2e] p-5 text-sm text-gray-300">
              <h2 className="font-bold text-white">{car ? `${car.make} ${car.model}` : "Vehicle unavailable"}</h2>
              <p className="mt-1">{booking.startDate} → {booking.endDate} · {booking.status}</p>
              <p className="mt-1 font-semibold text-emerald-400">{booking.total.toLocaleString()} ETB</p>
            </article>
          );
        })}
      </div>
      <Link href="/cars" className="mt-6 inline-block text-xs text-emerald-400">Browse cars</Link>
      {!currentUser.roles?.includes("owner") && (
        <button
          type="button"
          onClick={becomeOwner}
          className="ml-4 inline-block text-xs text-emerald-400 hover:text-emerald-300"
        >
          Become an owner
        </button>
      )}
    </div>
  );
}

export default function BookingsPage() {
  return <RoleGuard role="renter"><BookingHistory /></RoleGuard>;
}
