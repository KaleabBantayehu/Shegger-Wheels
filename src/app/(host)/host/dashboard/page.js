"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import {
  calculateBookingDays,
  isValidIsoDate,
  todayIsoDate,
} from "@/lib/bookingRules";

function addUtcDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function expandDateRange(startDate, endDate) {
  const days = calculateBookingDays(startDate, endDate);
  if (!days) return null;

  return Array.from({ length: days }, (_, index) =>
    addUtcDays(startDate, index),
  );
}

function groupUnavailableDates(dates) {
  const sortedDates = [...new Set(dates)]
    .filter(isValidIsoDate)
    .sort();

  return sortedDates.reduce((ranges, date) => {
    const currentRange = ranges[ranges.length - 1];
    if (!currentRange || addUtcDays(currentRange.endDate, 1) !== date) {
      ranges.push({ startDate: date, endDate: date });
    } else {
      currentRange.endDate = date;
    }
    return ranges;
  }, []);
}

export default function HostDashboard() {
  const {
    cars,
    bookings,
    currentUser,
    createCar,
    setCarAvailability,
    updateCar,
    softDeleteCar,
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
  const [availabilityCarId, setAvailabilityCarId] = useState("");
  const [availabilityStartDate, setAvailabilityStartDate] = useState("");
  const [availabilityEndDate, setAvailabilityEndDate] = useState("");
  const [availabilityBusy, setAvailabilityBusy] = useState(false);
  const [editingCarId, setEditingCarId] = useState("");
  const [editCar, setEditCar] = useState(null);
  const [vehicleBusy, setVehicleBusy] = useState(false);

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
    if (vehicleBusy) return;
    setActionError("");
    setActionSuccess("");
    setVehicleBusy(true);
    const result = createCar(newCar);

    if (!result.ok) {
      setActionError(result.error);
      setVehicleBusy(false);
      return;
    }

    setVehicleBusy(false);
    setActionSuccess("Vehicle submitted for approval.");
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

  const beginEditCar = (car) => {
    setActionError("");
    setActionSuccess("");
    setEditingCarId(car.id);
    setEditCar({
      make: car.make,
      model: car.model,
      edition: car.edition || "",
      year: car.year,
      seats: car.seats,
      pricePerDay: car.pricePerDay,
      neighbourhood: car.neighbourhood,
      transmission: car.transmission,
      photoUrl: car.photos?.[0] || "",
      description: car.description || "",
    });
  };

  const cancelEditCar = () => {
    setEditingCarId("");
    setEditCar(null);
  };

  const handleEditCar = (event) => {
    event.preventDefault();
    if (!editingCarId || !editCar || vehicleBusy) return;

    setActionError("");
    setActionSuccess("");
    setVehicleBusy(true);
    const { photoUrl, ...vehiclePatch } = editCar;
    const result = updateCar(editingCarId, {
      ...vehiclePatch,
      photos: [photoUrl],
    });
    setVehicleBusy(false);

    if (!result.ok) {
      setActionError(result.error);
      return;
    }

    setActionSuccess("Vehicle details updated successfully.");
    cancelEditCar();
  };

  const handleRetireCar = (car) => {
    if (vehicleBusy) return;

    setActionError("");
    setActionSuccess("");
    setVehicleBusy(true);
    const result = softDeleteCar(car.id);
    setVehicleBusy(false);

    if (!result.ok) {
      setActionError(result.error);
      return;
    }

    if (editingCarId === car.id) cancelEditCar();
    setActionSuccess(`${car.make} ${car.model} was retired. Existing bookings were preserved.`);
  };

  const resetAvailabilityForm = () => {
    setAvailabilityCarId("");
    setAvailabilityStartDate("");
    setAvailabilityEndDate("");
  };

  const handleAddUnavailableRange = (car) => {
    setActionError("");
    setActionSuccess("");

    if (!isValidIsoDate(availabilityStartDate) || !isValidIsoDate(availabilityEndDate)) {
      setActionError("Enter valid pickup and return dates.");
      return;
    }

    const dates = expandDateRange(availabilityStartDate, availabilityEndDate);
    if (!dates) {
      setActionError("The return date must be after the start date.");
      return;
    }

    setAvailabilityBusy(true);
    const result = setCarAvailability(car.id, [
      ...(Array.isArray(car.unavailableDates) ? car.unavailableDates : []),
      ...dates,
    ]);
    setAvailabilityBusy(false);

    if (!result.ok) {
      setActionError(result.error);
      return;
    }

    setActionSuccess(`Unavailable dates added for ${car.make} ${car.model}.`);
    resetAvailabilityForm();
  };

  const handleRemoveUnavailableRange = (car, range) => {
    setActionError("");
    setActionSuccess("");
    setAvailabilityBusy(true);

    const rangeDates = expandDateRange(
      range.startDate,
      addUtcDays(range.endDate, 1),
    );
    const datesToKeep = (car.unavailableDates || []).filter(
      (date) => !rangeDates.includes(date),
    );
    const result = setCarAvailability(car.id, datesToKeep);
    setAvailabilityBusy(false);

    if (!result.ok) {
      setActionError(result.error);
      return;
    }

    setActionSuccess(`Unavailable dates removed for ${car.make} ${car.model}.`);
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
          <div className="space-y-6">
          {editCar && (
            <form
              onSubmit={handleEditCar}
              className="bg-[#131d2e] border border-emerald-500/30 rounded-2xl p-6 space-y-4 text-xs"
            >
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <h2 className="text-lg font-bold text-white">Edit vehicle</h2>
                <button type="button" onClick={cancelEditCar} className="text-gray-400 hover:text-white">
                  Close
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  ["make", "Make"],
                  ["model", "Model"],
                  ["edition", "Edition"],
                  ["neighbourhood", "Neighbourhood"],
                  ["year", "Year"],
                  ["seats", "Seats"],
                  ["pricePerDay", "Daily Price (ETB)"],
                  ["photoUrl", "Image URL"],
                ].map(([field, label]) => (
                  <label key={field} htmlFor={`edit-${field}`} className="text-gray-400 font-semibold">
                    {label}
                    <input
                      id={`edit-${field}`}
                      name={field}
                      type={["year", "seats", "pricePerDay"].includes(field) ? "number" : field === "photoUrl" ? "url" : "text"}
                      value={editCar[field]}
                      onChange={(event) => setEditCar({ ...editCar, [field]: event.target.value })}
                      required={field !== "edition"}
                      className="mt-1 w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-white focus:outline-none"
                    />
                  </label>
                ))}
                <label htmlFor="edit-transmission" className="text-gray-400 font-semibold">
                  Transmission
                  <select
                    id="edit-transmission"
                    name="transmission"
                    value={editCar.transmission}
                    onChange={(event) => setEditCar({ ...editCar, transmission: event.target.value })}
                    className="mt-1 w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-white focus:outline-none"
                  >
                    <option value="automatic">Automatic</option>
                    <option value="manual">Manual</option>
                  </select>
                </label>
              </div>
              <label htmlFor="edit-description" className="block text-gray-400 font-semibold">
                Description
                <textarea
                  id="edit-description"
                  name="description"
                  rows={3}
                  value={editCar.description}
                  onChange={(event) => setEditCar({ ...editCar, description: event.target.value })}
                  required
                  className="mt-1 w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-white focus:outline-none"
                />
              </label>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={vehicleBusy}
                  className="rounded-xl bg-emerald-500 px-4 py-3 font-bold text-white hover:bg-emerald-600 disabled:opacity-50"
                >
                  {vehicleBusy ? "Saving..." : "Save changes"}
                </button>
                <button
                  type="button"
                  onClick={cancelEditCar}
                  disabled={vehicleBusy}
                  className="rounded-xl border border-gray-700 px-4 py-3 font-semibold text-gray-300 hover:border-gray-500 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
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
                      {car.status === "approved"
                        ? "Active / Approved"
                        : car.status === "inactive"
                          ? "Retired"
                          : "Pending Moderation"}
                    </span>
                  </div>

                  <div className="flex gap-2 px-4 pb-4">
                    <button
                      type="button"
                      onClick={() => beginEditCar(car)}
                      disabled={vehicleBusy}
                      className="flex-1 rounded-lg border border-emerald-500/40 px-3 py-2 text-[10px] font-bold text-emerald-300 hover:border-emerald-400 disabled:opacity-50"
                    >
                      Edit listing
                    </button>
                    {car.status !== "inactive" && (
                      <button
                        type="button"
                        onClick={() => handleRetireCar(car)}
                        disabled={vehicleBusy}
                        className="flex-1 rounded-lg border border-red-500/40 px-3 py-2 text-[10px] font-bold text-red-300 hover:border-red-400 disabled:opacity-50"
                      >
                        Retire
                      </button>
                    )}
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

                <div className="border-t border-gray-800 px-4 py-4 space-y-3">
                  <div>
                    <h4 className="text-xs font-bold text-white">Unavailable dates</h4>
                    <p className="mt-1 text-[10px] text-gray-500">
                      Return date is exclusive.
                    </p>
                  </div>
                  {groupUnavailableDates(car.unavailableDates || []).length === 0 ? (
                    <p className="text-[10px] text-gray-500">No unavailable dates set.</p>
                  ) : (
                    <div className="space-y-2">
                      {groupUnavailableDates(car.unavailableDates || []).map((range) => (
                        <div
                          key={`${car.id}-${range.startDate}-${range.endDate}`}
                          className="flex items-center justify-between gap-2 rounded-lg bg-black/20 px-2.5 py-2 text-[10px] text-gray-300"
                        >
                          <span>
                            {range.startDate} → {addUtcDays(range.endDate, 1)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveUnavailableRange(car, range)}
                            disabled={availabilityBusy}
                            className="font-semibold text-red-300 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {availabilityCarId === car.id ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <label className="text-[10px] text-gray-400">
                          Start date
                          <input
                            type="date"
                            value={availabilityStartDate}
                            onChange={(event) => setAvailabilityStartDate(event.target.value)}
                            className="mt-1 w-full rounded-lg border border-gray-800 bg-gray-900 p-2 text-[10px] text-white"
                          />
                        </label>
                        <label className="text-[10px] text-gray-400">
                          Return date
                          <input
                            type="date"
                            value={availabilityEndDate}
                            onChange={(event) => setAvailabilityEndDate(event.target.value)}
                            className="mt-1 w-full rounded-lg border border-gray-800 bg-gray-900 p-2 text-[10px] text-white"
                          />
                        </label>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleAddUnavailableRange(car)}
                          disabled={availabilityBusy}
                          className="rounded-lg bg-emerald-500 px-3 py-2 text-[10px] font-bold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {availabilityBusy ? "Saving..." : "Add unavailable range"}
                        </button>
                        <button
                          type="button"
                          onClick={resetAvailabilityForm}
                          disabled={availabilityBusy}
                          className="rounded-lg border border-gray-700 px-3 py-2 text-[10px] font-semibold text-gray-300 hover:border-gray-500 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setAvailabilityCarId(car.id);
                        setActionError("");
                        setActionSuccess("");
                      }}
                      className="text-[10px] font-semibold text-emerald-400 hover:text-emerald-300"
                    >
                      + Block dates
                    </button>
                  )}
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

          <form onSubmit={handleAddCar} aria-busy={vehicleBusy} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="new-car-make" className="block text-gray-400 font-semibold mb-1">Make</label>
                <input
                  id="new-car-make"
                  name="make"
                  type="text"
                  placeholder="e.g. Toyota"
                  value={newCar.make}
                  onChange={(e) => setNewCar({ ...newCar, make: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-white focus:outline-none"
                  required
                />
              </div>
              <div>
                <label htmlFor="new-car-model" className="block text-gray-400 font-semibold mb-1">Model</label>
                <input
                  id="new-car-model"
                  name="model"
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
                <label htmlFor="new-car-year" className="block text-gray-400 font-semibold mb-1">Year</label>
                <input
                  id="new-car-year"
                  name="year"
                  type="number"
                  value={newCar.year}
                  onChange={(e) => setNewCar({ ...newCar, year: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-white focus:outline-none"
                  required
                />
              </div>
              <div>
                <label htmlFor="new-car-seats" className="block text-gray-400 font-semibold mb-1">Seats</label>
                <input
                  id="new-car-seats"
                  name="seats"
                  type="number"
                  value={newCar.seats}
                  onChange={(e) => setNewCar({ ...newCar, seats: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-white focus:outline-none"
                  required
                />
              </div>
              <div>
                <label htmlFor="new-car-price" className="block text-gray-400 font-semibold mb-1">Daily Price (ETB)</label>
                <input
                  id="new-car-price"
                  name="pricePerDay"
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
                <label htmlFor="new-car-neighbourhood" className="block text-gray-400 font-semibold mb-1">Neighbourhood</label>
                <select
                  id="new-car-neighbourhood"
                  name="neighbourhood"
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
                <label htmlFor="new-car-transmission" className="block text-gray-400 font-semibold mb-1">Transmission</label>
                <select
                  id="new-car-transmission"
                  name="transmission"
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
              <label htmlFor="new-car-photo" className="block text-gray-400 font-semibold mb-1">Image URL</label>
              <input
                id="new-car-photo"
                name="photoUrl"
                type="url"
                value={newCar.photoUrl}
                onChange={(e) => setNewCar({ ...newCar, photoUrl: e.target.value })}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-white focus:outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="new-car-description" className="block text-gray-400 font-semibold mb-1">Description</label>
              <textarea
                id="new-car-description"
                name="description"
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
              disabled={vehicleBusy}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition shadow-md"
            >
              {vehicleBusy ? "Submitting…" : "Submit Vehicle for Approval"}
            </button>
          </form>
        </div>
      )}

    </div>
  );
}