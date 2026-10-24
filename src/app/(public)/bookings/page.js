"use client";

import { useState } from "react";
import Link from "next/link";
import RoleGuard from "@/components/RoleGuard";
import { useApp } from "@/context/AppContext";
import { todayIsoDate } from "@/lib/bookingRules";

function BookingHistory() {
  const { bookings, currentUser, cars, becomeOwner, cancelBooking } = useApp();
  const ownBookings = bookings.filter((booking) => booking.renterId === currentUser?.id);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [cancellingId, setCancellingId] = useState("");

  const handleCancel = (bookingId) => {
    if (cancellingId) return;

    setActionError("");
    setActionSuccess("");
    setCancellingId(bookingId);
    const result = cancelBooking(bookingId);
    setCancellingId("");

    if (!result.ok) {
      setActionError(result.error);
      return;
    }

    setActionSuccess("Booking cancelled successfully.");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-extrabold text-white">My bookings</h1>
      {actionError && (
        <p role="alert" className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
          {actionError}
        </p>
      )}
      {actionSuccess && (
        <p role="status" className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
          {actionSuccess}
        </p>
      )}
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
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="font-bold text-white">{car ? `${car.make} ${car.model}` : "Vehicle unavailable"}</h2>
                  <p className="mt-1">
                    {booking.startDate} → {booking.endDate} ·{" "}
                    <span className="capitalize">{booking.status.replace("_", " ")}</span>
                  </p>
                </div>
                {(booking.status === "requested" ||
                  (booking.status === "confirmed" &&
                    booking.startDate > todayIsoDate())) && (
                  <button
                    type="button"
                    onClick={() => handleCancel(booking.id)}
                    disabled={cancellingId === booking.id}
                    className="rounded-xl border border-red-500/40 px-3 py-2 text-xs font-semibold text-red-300 transition hover:border-red-400 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {cancellingId === booking.id ? "Cancelling..." : "Cancel booking"}
                  </button>
                )}
              </div>
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
