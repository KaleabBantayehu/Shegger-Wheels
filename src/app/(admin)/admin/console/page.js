"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { INITIAL_CARS, INITIAL_USERS, INITIAL_BOOKINGS } from "@/lib/seedData";

export default function AdminConsole() {
  const [cars, setCars] = useState(INITIAL_CARS);
  const [users, setUsers] = useState(INITIAL_USERS);
  const [activeTab, setActiveTab] = useState("moderation"); // "moderation" | "vehicles" | "users"

  // Action handlers
  const handleApproveCar = (carId) => {
    setCars((prevCars) =>
      prevCars.map((c) => (c.id === carId ? { ...c, status: "approved" } : c))
    );
  };

  const handleRejectCar = (carId) => {
    setCars((prevCars) =>
      prevCars.map((c) => (c.id === carId ? { ...c, status: "rejected" } : c))
    );
  };

  // Metrics calculation
  const pendingCars = cars.filter((c) => c.status === "pending");
  const approvedCars = cars.filter((c) => c.status === "approved");
  const totalGrossVolume = INITIAL_BOOKINGS.reduce((sum, b) => sum + b.total, 0);
  const totalPlatformFees = INITIAL_BOOKINGS.reduce((sum, b) => sum + b.fee, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Console Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-red-500/10 text-red-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-red-500/30">
              Admin Restricted Access
            </span>
            <span className="text-xs text-gray-400">• Abebe Kebede</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Sheggar Wheels Governance Console
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Review vehicle submissions, enforce identity vetting, and monitor platform health across Addis Ababa.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs font-semibold text-emerald-400">System Live & Synchronized</span>
        </div>
      </div>

      {/* Platform Analytics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#131d2e] border border-gray-800 p-4 rounded-2xl">
          <p className="text-xs text-gray-400 font-medium">Pending Moderation</p>
          <p className="text-xl font-extrabold text-amber-400 mt-1">
            {pendingCars.length} <span className="text-xs font-normal text-gray-400">Vehicles</span>
          </p>
        </div>
        <div className="bg-[#131d2e] border border-gray-800 p-4 rounded-2xl">
          <p className="text-xs text-gray-400 font-medium">Active Fleet Size</p>
          <p className="text-xl font-extrabold text-emerald-400 mt-1">
            {approvedCars.length} <span className="text-xs font-normal text-gray-400">Approved</span>
          </p>
        </div>
        <div className="bg-[#131d2e] border border-gray-800 p-4 rounded-2xl">
          <p className="text-xs text-gray-400 font-medium">Gross Rental Volume</p>
          <p className="text-xl font-extrabold text-white mt-1">
            {totalGrossVolume.toLocaleString()} <span className="text-xs font-normal text-emerald-400">ETB</span>
          </p>
        </div>
        <div className="bg-[#131d2e] border border-gray-800 p-4 rounded-2xl">
          <p className="text-xs text-gray-400 font-medium">Platform Service Fees (5%)</p>
          <p className="text-xl font-extrabold text-white mt-1">
            {totalPlatformFees.toLocaleString()} <span className="text-xs font-normal text-emerald-400">ETB</span>
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-800 text-xs font-bold gap-6">
        <button
          onClick={() => setActiveTab("moderation")}
          className={`pb-3 transition flex items-center gap-1.5 ${
            activeTab === "moderation"
              ? "text-emerald-400 border-b-2 border-emerald-400"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Vehicle Queue
          {pendingCars.length > 0 && (
            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] px-1.5 py-0.2 rounded-full">
              {pendingCars.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("vehicles")}
          className={`pb-3 transition ${
            activeTab === "vehicles"
              ? "text-emerald-400 border-b-2 border-emerald-400"
              : "text-gray-400 hover:text-white"
          }`}
        >
          All Inventory ({cars.length})
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`pb-3 transition ${
            activeTab === "users"
              ? "text-emerald-400 border-b-2 border-emerald-400"
              : "text-gray-400 hover:text-white"
          }`}
        >
          User Registry ({users.length})
        </button>
      </div>

      {/* Tab 1: Moderation Queue */}
      {activeTab === "moderation" && (
        <div className="space-y-4">
          {pendingCars.length === 0 ? (
            <div className="bg-[#131d2e] border border-gray-800 rounded-2xl p-8 text-center space-y-2">
              <p className="text-emerald-400 font-bold text-sm">✓ Moderation Queue Clean</p>
              <p className="text-xs text-gray-400">All submitted vehicles have been reviewed and processed.</p>
            </div>
          ) : (
            pendingCars.map((car) => (
              <div
                key={car.id}
                className="bg-[#131d2e] border border-gray-800 rounded-2xl p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4">
                  <div className="relative w-28 h-20 rounded-xl overflow-hidden bg-gray-900 border border-gray-800 shrink-0">
                    <Image
                      src={car.photos[0]}
                      alt={`${car.make} ${car.model}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-sm">
                        {car.make} {car.model}
                      </h3>
                      <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[9px] font-bold px-2 py-0.5 rounded-full">
                        Pending Vetting
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      Host: <span className="text-gray-200 font-semibold">{car.hostName || "Local Host"}</span> • 📍 {car.neighbourhood}
                    </p>
                    <p className="text-xs font-bold text-emerald-400">
                      {car.pricePerDay.toLocaleString()} ETB / day
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto border-t lg:border-t-0 pt-3 lg:pt-0 border-gray-800">
                  <Link
                    href={`/cars/${car.id}`}
                    className="bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold px-4 py-2 rounded-xl transition text-center flex-1 lg:flex-initial"
                  >
                    Inspect Preview
                  </Link>
                  <button
                    onClick={() => handleRejectCar(car.id)}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold px-4 py-2 rounded-xl transition flex-1 lg:flex-initial"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApproveCar(car.id)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-5 py-2 rounded-xl transition shadow-md flex-1 lg:flex-initial"
                  >
                    Approve Listing
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: All Vehicles Registry Table */}
      {activeTab === "vehicles" && (
        <div className="bg-[#131d2e] border border-gray-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-black/30 text-gray-400 uppercase text-[10px] font-bold border-b border-gray-800">
                <tr>
                  <th className="p-4">Vehicle</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Host</th>
                  <th className="p-4">Price / Day</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {cars.map((car) => (
                  <tr key={car.id} className="hover:bg-gray-800/30">
                    <td className="p-4 font-bold text-white">
                      {car.make} {car.model} ({car.year})
                    </td>
                    <td className="p-4">{car.neighbourhood}</td>
                    <td className="p-4">{car.hostName || "Owner"}</td>
                    <td className="p-4 font-bold text-emerald-400">
                      {car.pricePerDay.toLocaleString()} ETB
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          car.status === "approved"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : car.status === "rejected"
                            ? "bg-red-500/10 text-red-400 border-red-500/30"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        }`}
                      >
                        {car.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <Link
                        href={`/cars/${car.id}`}
                        className="text-xs text-emerald-400 font-semibold hover:underline"
                      >
                        Inspect →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Registered Users Table */}
      {activeTab === "users" && (
        <div className="bg-[#131d2e] border border-gray-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-black/30 text-gray-400 uppercase text-[10px] font-bold border-b border-gray-800">
                <tr>
                  <th className="p-4">User ID</th>
                  <th className="p-4">Full Name</th>
                  <th className="p-4">Email Address</th>
                  <th className="p-4">Phone Number</th>
                  <th className="p-4">Assigned Roles</th>
                  <th className="p-4">Account Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-800/30">
                    <td className="p-4 font-bold text-white">{u.id}</td>
                    <td className="p-4 font-semibold text-white">{u.name}</td>
                    <td className="p-4">{u.email}</td>
                    <td className="p-4">{u.phone}</td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        {u.roles.map((r, idx) => (
                          <span
                            key={idx}
                            className="bg-gray-800 text-gray-300 border border-gray-700 px-2 py-0.5 rounded text-[10px] uppercase font-bold"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                        {u.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}