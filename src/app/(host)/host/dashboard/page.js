"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { todayIsoDate } from "@/lib/bookingRules";

export default function HostDashboard() {
  const {
    cars,
    bookings,
    currentUser,
    createCar,
    updateBookingStatus,
  } = useApp();
  const ownedCars = cars.filter((car) => car.ownerId === currentUser?.id);
  const ownedCarIds = new Set(ownedCars.map((car) => car.id));
  const ownedBookings = bookings.filter((booking) => ownedCarIds.has(booking.carId));
  const firstName =
    (currentUser?.name || "Host")
      .replace(/\s*\([^)]*\)\s*$/, "")
      .trim()
      .split(/\s+/)[0] || "Host";
  const [activeTab, setActiveTab] = useState("vehicles"); // "vehicles" | "bookings" | "add-car"
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [pendingBookingAction, setPendingBookingAction] = useState("");

  // Form state for adding a new car
  const [newCar, setNewCar] = useState({
    make: "",
    model: "",
    edition: "",
    year: 2024,
    transmission: "automatic",
    fuel: "Petrol",
    seats: 5,
    neighbourhood: "Bole",
    pricePerDay: 5000,
    photoUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
    description: "",
  });

  // Calculate metrics
  const totalVehicles = ownedCars.length;
  const approvedVehicles = ownedCars.filter((c) => c.status === "approved").length;
  const pendingVehicles = ownedCars.filter((c) => c.status === "pending").length;
  const totalEarnings = ownedBookings.reduce((sum, b) => sum + b.total, 0);

  const handleAddCar = (e) => {
    e.preventDefault();
    const result = createCar(newCar);

    if (!result.ok) {
      setActionError(result.error);
      return;
    }

    setActionError("");
    setActiveTab("vehicles");
    setNewCar({
      make: "",
      model: "",
      edition: "",
      year: 2024,
      transmission: "automatic",
      fuel: "Petrol",
      seats: 5,
      neighbourhood: "Bole",
      pricePerDay: 5000,
      photoUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
      description: "",
    });
  };

  const handleBookingAction = (bookingId, status) => {
    if (pendingBookingAction) return;

    setActionError("");
    setActionSuccess("");
    setPendingBookingAction(`${bookingId}:${status}`);
    const result = updateBookingStatus(bookingId, status);
    setPendingBookingAction("");

    if (!result.ok) {
      setActionError(result.error);
      return;
    }

    const successMessage = {
      confirmed: "Booking request confirmed.",
      declined: "Booking request declined.",
      completed: "Booking marked as completed.",
    }[status];
    setActionSuccess(successMessage);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
            Host Management Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Welcome back, {firstName}
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Manage your fleet, track earnings, and list new vehicles across Addis Ababa.
          </p>
        </div>

        <button
          onClick={() => setActiveTab("add-car")}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-md self-start sm:self-auto"
        >
          + List New Vehicle
        </button>
      </div>

      {actionError && (
        <div
          role="alert"
          className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-semibold p-3 rounded-xl"
        >
          {actionError}
        </div>
      )}
      {actionSuccess && (
        <div
          role="status"
          className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold p-3 rounded-xl"
        >
          {actionSuccess}
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#131d2e] border border-gray-800 p-4 rounded-2xl">
          <p className="text-xs text-gray-400 font-medium">Total Revenue</p>
          <p className="text-xl font-extrabold text-white mt-1">
            {totalEarnings.toLocaleString()} <span className="text-xs text-emerald-400 font-normal">ETB</span>
          </p>
        </div>
        <div className="bg-[#131d2e] border border-gray-800 p-4 rounded-2xl">
          <p className="text-xs text-gray-400 font-medium">Total Fleet</p>
          <p className="text-xl font-extrabold text-white mt-1">{totalVehicles} Vehicles</p>
        </div>
        <div className="bg-[#131d2e] border border-gray-800 p-4 rounded-2xl">
          <p className="text-xs text-gray-400 font-medium">Active Listings</p>
          <p className="text-xl font-extrabold text-emerald-400 mt-1">{approvedVehicles} Approved</p>
        </div>
        <div className="bg-[#131d2e] border border-gray-800 p-4 rounded-2xl">
          <p className="text-xs text-gray-400 font-medium">Pending Vetting</p>
          <p className="text-xl font-extrabold text-amber-400 mt-1">{pendingVehicles} Pending</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-800 text-xs font-bold gap-6">
        <button
          onClick={() => setActiveTab("vehicles")}
          className={`pb-3 transition ${
            activeTab === "vehicles"
              ? "text-emerald-400 border-b-2 border-emerald-400"
              : "text-gray-400 hover:text-white"
          }`}
        >
          My Fleet ({ownedCars.length})
        </button>
        <button
          onClick={() => setActiveTab("bookings")}
          className={`pb-3 transition ${
            activeTab === "bookings"
              ? "text-emerald-400 border-b-2 border-emerald-400"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Bookings ({ownedBookings.length})
        </button>
        <button
          onClick={() => setActiveTab("add-car")}
          className={`pb-3 transition ${
            activeTab === "add-car"
              ? "text-emerald-400 border-b-2 border-emerald-400"
              : "text-gray-400 hover:text-white"
          }`}
        >
          + Add Vehicle
        </button>
      </div>

      {/* Tab 1: Vehicles List */}
      {activeTab === "vehicles" && (
        ownedCars.length === 0 ? (
          <div className="bg-[#131d2e] border border-gray-800 rounded-2xl p-8 text-center space-y-3">
            <h2 className="text-lg font-extrabold text-white">
              No vehicles in your fleet yet
            </h2>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              List your first vehicle to start receiving booking requests. New
              listings stay pending until an administrator approves them.
            </p>
            <button
              type="button"
              onClick={() => setActiveTab("add-car")}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition"
            >
              List a vehicle
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ownedCars.map((car) => (
            <div
              key={car.id}
              className="bg-[#131d2e] rounded-2xl border border-gray-800 overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative h-40 w-full bg-gray-900">
                  <Image
                    src={car.photos[0]}
                    alt={`${car.make} ${car.model}`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border backdrop-blur-md ${
                        car.status === "approved"
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                      }`}
                    >
                      {car.status === "approved" ? "Active / Approved" : "Pending Moderation"}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-white text-sm">
                    {car.make} {car.model}
                  </h3>
                  <p className="text-xs text-gray-400">
                    📍 {car.neighbourhood} • {car.year}
                  </p>
                  <p className="text-xs font-extrabold text-white pt-1">
                    {car.pricePerDay.toLocaleString()} ETB / day
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0 border-t border-gray-800/80 mt-2 flex justify-between items-center bg-black/20">
                <Link
                  href={`/cars/${car.id}`}
                  className="text-xs text-emerald-400 font-semibold hover:underline"
                >
                  View Public Page →
                </Link>
                <span className="text-[10px] text-gray-500">{car.transmission}</span>
              </div>
            </div>
            ))}
          </div>
        )
      )}

      {/* Tab 2: Booking History */}
      {activeTab === "bookings" && (
        ownedBookings.length === 0 ? (
          <div className="bg-[#131d2e] border border-gray-800 rounded-2xl p-8 text-center space-y-2">
            <h2 className="text-lg font-extrabold text-white">
              No bookings yet
            </h2>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              Bookings for your approved vehicles will appear here once renters
              request a trip.
            </p>
          </div>
        ) : (
        <div className="bg-[#131d2e] border border-gray-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-black/30 text-gray-400 uppercase text-[10px] font-bold border-b border-gray-800">
                <tr>
                  <th className="p-4">Booking ID</th>
                  <th className="p-4">Dates</th>
                  <th className="p-4">Days</th>
                  <th className="p-4">Total Revenue</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {ownedBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-800/30">
                    <td className="p-4 font-bold text-white">{booking.id}</td>
                    <td className="p-4">
                      {booking.startDate} → {booking.endDate}
                    </td>
                    <td className="p-4">{booking.days} days</td>
                    <td className="p-4 font-bold text-emerald-400">
                      {booking.total.toLocaleString()} ETB
                    </td>
                    <td className="p-4 capitalize">
                      <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-semibold">
                        {booking.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4 capitalize">{booking.status}</td>
                    <td className="p-4">
                      {booking.status === "requested" && (
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleBookingAction(booking.id, "confirmed")}
                            disabled={Boolean(pendingBookingAction)}
                            className="rounded-lg bg-emerald-500 px-2.5 py-1.5 text-[10px] font-bold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {pendingBookingAction === `${booking.id}:confirmed` ? "Saving..." : "Confirm"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleBookingAction(booking.id, "declined")}
                            disabled={Boolean(pendingBookingAction)}
                            className="rounded-lg border border-red-500/40 px-2.5 py-1.5 text-[10px] font-bold text-red-300 transition hover:border-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {pendingBookingAction === `${booking.id}:declined` ? "Saving..." : "Decline"}
                          </button>
                        </div>
                      )}
                      {booking.status === "confirmed" &&
                        booking.endDate <= todayIsoDate() && (
                        <button
                          type="button"
                          onClick={() => handleBookingAction(booking.id, "completed")}
                          disabled={Boolean(pendingBookingAction)}
                          className="rounded-lg bg-emerald-500 px-2.5 py-1.5 text-[10px] font-bold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {pendingBookingAction === `${booking.id}:completed` ? "Saving..." : "Mark completed"}
                        </button>
                      )}
                      {booking.status === "confirmed" &&
                        booking.endDate > todayIsoDate() && (
                        <span className="text-[10px] text-gray-500">Available after return date</span>
                      )}
                      {["declined", "cancelled", "completed"].includes(booking.status) && (
                        <span className="text-[10px] text-gray-500">No actions available</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )
      )}

      {/* Tab 3: Add Vehicle Form */}
      {activeTab === "add-car" && (
        <div className="bg-[#131d2e] border border-gray-800 rounded-2xl p-6 max-w-2xl mx-auto space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-gray-800 pb-3">
            List a New Vehicle
          </h2>

          <form onSubmit={handleAddCar} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 font-semibold mb-1">Make</label>
                <input
                  type="text"
                  placeholder="e.g. Toyota"
                  value={newCar.make}
                  onChange={(e) => setNewCar({ ...newCar, make: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-white focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 font-semibold mb-1">Model</label>
                <input
                  type="text"
                  placeholder="e.g. Corolla"
                  value={newCar.model}
                  onChange={(e) => setNewCar({ ...newCar, model: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-white focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-400 font-semibold mb-1">Year</label>
                <input
                  type="number"
                  value={newCar.year}
                  onChange={(e) => setNewCar({ ...newCar, year: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-white focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 font-semibold mb-1">Seats</label>
                <input
                  type="number"
                  value={newCar.seats}
                  onChange={(e) => setNewCar({ ...newCar, seats: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-white focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 font-semibold mb-1">Daily Price (ETB)</label>
                <input
                  type="number"
                  value={newCar.pricePerDay}
                  onChange={(e) => setNewCar({ ...newCar, pricePerDay: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-white focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 font-semibold mb-1">Neighbourhood</label>
                <select
                  value={newCar.neighbourhood}
                  onChange={(e) => setNewCar({ ...newCar, neighbourhood: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-white focus:outline-none"
                >
                  <option value="Bole">Bole</option>
                  <option value="Kazanchis">Kazanchis</option>
                  <option value="Piassa">Piassa</option>
                  <option value="CMC">CMC</option>
                  <option value="Sarbet">Sarbet</option>
                  <option value="Old Airport">Old Airport</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 font-semibold mb-1">Transmission</label>
                <select
                  value={newCar.transmission}
                  onChange={(e) => setNewCar({ ...newCar, transmission: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-white focus:outline-none"
                >
                  <option value="automatic">Automatic</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-gray-400 font-semibold mb-1">Image URL</label>
              <input
                type="url"
                value={newCar.photoUrl}
                onChange={(e) => setNewCar({ ...newCar, photoUrl: e.target.value })}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-white focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 font-semibold mb-1">Description</label>
              <textarea
                rows={3}
                placeholder="Describe your vehicle's features and pickup instructions..."
                value={newCar.description}
                onChange={(e) => setNewCar({ ...newCar, description: e.target.value })}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-white focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition shadow-md"
            >
              Submit Vehicle for Approval
            </button>
          </form>
        </div>
      )}

    </div>
  );
}