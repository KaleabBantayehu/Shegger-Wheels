"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { INITIAL_CARS, INITIAL_BOOKINGS, INITIAL_USERS } from "@/lib/seedData";
import {
  STORAGE_KEYS,
  initializeDemoData,
  readStorage,
  writeStorage,
} from "@/lib/storage";
import {
  getCurrentSession,
  hasRole,
  signInAsDemoUser,
  addOwnerRole,
  registerUser as persistRegistration,
  signOut as clearDemoSession,
} from "@/lib/auth";
import {
  calculateBookingDays,
  calculateBookingTotals,
  hasBookingOverlap,
  isCarUnavailable,
  isValidIsoDate,
  todayIsoDate,
} from "@/lib/bookingRules";

const AppContext = createContext(null);

const VALID_CAR_STATUSES = [
  "draft",
  "pending",
  "approved",
  "rejected",
  "inactive",
];

const VALID_BOOKING_STATUSES = [
  "requested",
  "confirmed",
  "in_progress",
  "completed",
  "reviewed",
  "declined",
  "cancelled",
  "disputed",
  "resolved",
];

function getInitialData() {
  // These seed values are also used during server rendering so the first HTML
  // and the first client render match. localStorage is only read after mount.
  return {
    users: INITIAL_USERS,
    cars: INITIAL_CARS,
    bookings: INITIAL_BOOKINGS,
    reviews: [],
    disputes: [],
    announcements: [],
  };
}

function createId(prefix) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function validateCarInput(input) {
  if (!input.make || !String(input.make).trim()) return "Make is required";
  if (!input.model || !String(input.model).trim()) return "Model is required";

  const year = Number(input.year);
  if (!Number.isInteger(year) || year < 1900 || year > 2100) {
    return "Year must be a valid number";
  }

  const seats = Number(input.seats);
  if (!Number.isInteger(seats) || seats < 1 || seats > 30) {
    return "Seats must be between 1 and 30";
  }

  const pricePerDay = Number(input.pricePerDay);
  if (!Number.isFinite(pricePerDay) || pricePerDay <= 0) {
    return "Daily price must be greater than zero";
  }

  return null;
}

function normalizePhotos(input) {
  if (Array.isArray(input.photos) && input.photos.length > 0) {
    return input.photos;
  }

  if (input.photoUrl && String(input.photoUrl).trim()) {
    return [String(input.photoUrl).trim()];
  }

  return ["/images/cars/prado.avif"];
}

export function AppProvider({ children }) {
  const [data, setData] = useState(getInitialData);
  const [session, setSession] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate once in the browser. initializeDemoData() is idempotent, so React
  // Strict Mode mounting the effect twice cannot overwrite existing user data.
  useEffect(() => {
    initializeDemoData();

    // Browser storage is an external system that is not available during SSR.
    // The first render must use the deterministic seed data, then this effect
    // hydrates the real stored values. Disabling the cascading-render lint rule
    // is intentional and limited to this one-time hydration.
    /* eslint-disable react-hooks/set-state-in-effect */
    setData({
      users: readStorage(STORAGE_KEYS.users, INITIAL_USERS),
      cars: readStorage(STORAGE_KEYS.cars, INITIAL_CARS),
      bookings: readStorage(STORAGE_KEYS.bookings, INITIAL_BOOKINGS),
      reviews: readStorage(STORAGE_KEYS.reviews, []),
      disputes: readStorage(STORAGE_KEYS.disputes, []),
      announcements: readStorage(STORAGE_KEYS.announcements, []),
    });
    setSession(getCurrentSession());
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // The active user is derived from the session plus the reactive user list.
  const currentUser = useMemo(() => {
    if (!session || !session.userId) return null;

    const user = data.users.find((candidate) => candidate.id === session.userId);
    if (!user || user.status === "suspended") return null;

    return user;
  }, [data.users, session]);

  const signInDemoUser = useCallback((userId) => {
    const result = signInAsDemoUser(userId);
    if (result.ok) setSession(getCurrentSession());
    return result;
  }, []);

  const registerRenter = useCallback((input) => {
    const result = persistRegistration(input);
    if (result.ok) {
      setData((previous) => ({
        ...previous,
        users: readStorage(STORAGE_KEYS.users, previous.users),
      }));
      setSession(getCurrentSession());
    }
    return result;
  }, []);

  const becomeOwner = useCallback(() => {
    if (!currentUser) return { ok: false, error: "Not signed in" };
    const result = addOwnerRole(currentUser.id);
    if (result.ok) {
      setData((previous) => ({
        ...previous,
        users: readStorage(STORAGE_KEYS.users, previous.users),
      }));
    }
    return result;
  }, [currentUser]);

  const signOutUser = useCallback(() => {
    clearDemoSession();
    setSession(null);
    return { ok: true };
  }, []);

  const createCar = useCallback(
    (input) => {
      if (!currentUser) return { ok: false, error: "Not signed in" };
      if (!hasRole(currentUser, "owner")) {
        return { ok: false, error: "Owner access required" };
      }

      const validationError = validateCarInput(input);
      if (validationError) return { ok: false, error: validationError };

      const now = new Date().toISOString();
      const car = {
        id: createId("car"),
        ownerId: currentUser.id,
        make: String(input.make).trim(),
        model: String(input.model).trim(),
        edition: input.edition ? String(input.edition).trim() : "Standard",
        year: Number(input.year),
        transmission: input.transmission === "manual" ? "manual" : "automatic",
        fuel: input.fuel ? String(input.fuel).trim() : "Petrol",
        seats: Number(input.seats),
        city: input.city ? String(input.city).trim() : "Addis Ababa",
        neighbourhood: input.neighbourhood
          ? String(input.neighbourhood).trim()
          : "Bole",
        latitude: Number(input.latitude) || 9.0107,
        longitude: Number(input.longitude) || 38.7612,
        pricePerDay: Number(input.pricePerDay),
        rating: Number(input.rating) || 5,
        reviewsCount: Number(input.reviewsCount) || 0,
        tags: Array.isArray(input.tags) ? input.tags : ["Pending Approval"],
        hostName: currentUser.name,
        hostLocation: input.hostLocation
          ? String(input.hostLocation).trim()
          : String(input.neighbourhood || "Addis Ababa"),
        isSuperhost: Boolean(input.isSuperhost),
        photos: normalizePhotos(input),
        description: input.description ? String(input.description).trim() : "",
        status: "pending",
        unavailableDates: Array.isArray(input.unavailableDates)
          ? input.unavailableDates
          : [],
        createdAt: now,
      };

      const nextCars = [car, ...data.cars];
      if (!writeStorage(STORAGE_KEYS.cars, nextCars)) {
        return { ok: false, error: "Could not save the vehicle" };
      }

      setData((previous) => ({ ...previous, cars: nextCars }));
      return { ok: true, car };
    },
    [currentUser, data.cars],
  );

  const updateCar = useCallback(
    (carId, patch) => {
      if (!currentUser) return { ok: false, error: "Not signed in" };

      const car = data.cars.find((candidate) => candidate.id === carId);
      if (!car) return { ok: false, error: "Car not found" };

      const isAdmin = hasRole(currentUser, "admin");
      const isOwner = hasRole(currentUser, "owner") && car.ownerId === currentUser.id;

      if (!isAdmin && !isOwner) {
        return { ok: false, error: "Not yours" };
      }

      const safePatch = { ...patch };
      delete safePatch.id;
      delete safePatch.ownerId;
      delete safePatch.createdAt;

      if (!isAdmin) {
        delete safePatch.status;
      }

      if (safePatch.status && !VALID_CAR_STATUSES.includes(safePatch.status)) {
        return { ok: false, error: "Invalid car status" };
      }

      if (safePatch.unavailableDates) {
        const datesAreValid = safePatch.unavailableDates.every(isValidIsoDate);
        if (!datesAreValid) {
          return { ok: false, error: "Invalid unavailable date" };
        }
      }

      if ("year" in safePatch) {
        const year = Number(safePatch.year);
        if (!Number.isInteger(year) || year < 1900 || year > 2100) {
          return { ok: false, error: "Year must be a valid number" };
        }
        safePatch.year = year;
      }

      if ("seats" in safePatch) {
        const seats = Number(safePatch.seats);
        if (!Number.isInteger(seats) || seats < 1 || seats > 30) {
          return { ok: false, error: "Seats must be between 1 and 30" };
        }
        safePatch.seats = seats;
      }

      if ("pricePerDay" in safePatch) {
        const price = Number(safePatch.pricePerDay);
        if (!Number.isFinite(price) || price <= 0) {
          return { ok: false, error: "Daily price must be greater than zero" };
        }
        safePatch.pricePerDay = price;
      }

      const nextCars = data.cars.map((candidate) =>
        candidate.id === carId ? { ...candidate, ...safePatch } : candidate,
      );

      if (!writeStorage(STORAGE_KEYS.cars, nextCars)) {
        return { ok: false, error: "Could not update the vehicle" };
      }

      setData((previous) => ({ ...previous, cars: nextCars }));
      return { ok: true };
    },
    [currentUser, data.cars],
  );

  const setCarStatus = useCallback(
    (carId, status) => {
      if (!currentUser) return { ok: false, error: "Not signed in" };
      if (!hasRole(currentUser, "admin")) {
        return { ok: false, error: "Admin access required" };
      }
      if (!VALID_CAR_STATUSES.includes(status)) {
        return { ok: false, error: "Invalid car status" };
      }

      const carExists = data.cars.some((candidate) => candidate.id === carId);
      if (!carExists) return { ok: false, error: "Car not found" };

      const nextCars = data.cars.map((candidate) =>
        candidate.id === carId ? { ...candidate, status } : candidate,
      );

      if (!writeStorage(STORAGE_KEYS.cars, nextCars)) {
        return { ok: false, error: "Could not update the vehicle" };
      }

      setData((previous) => ({ ...previous, cars: nextCars }));
      return { ok: true };
    },
    [currentUser, data.cars],
  );

  const softDeleteCar = useCallback(
    (carId) => {
      if (!currentUser) return { ok: false, error: "Not signed in" };

      const car = data.cars.find((candidate) => candidate.id === carId);
      if (!car) return { ok: false, error: "Car not found" };

      const isAdmin = hasRole(currentUser, "admin");
      const isOwner = hasRole(currentUser, "owner") && car.ownerId === currentUser.id;
      if (!isAdmin && !isOwner) return { ok: false, error: "Not yours" };

      // Bookings and reviews keep their foreign keys; the listing is only retired.
      const nextCars = data.cars.map((candidate) =>
        candidate.id === carId ? { ...candidate, status: "inactive" } : candidate,
      );

      if (!writeStorage(STORAGE_KEYS.cars, nextCars)) {
        return { ok: false, error: "Could not retire the vehicle" };
      }

      setData((previous) => ({ ...previous, cars: nextCars }));
      return { ok: true };
    },
    [currentUser, data.cars],
  );

  const setCarAvailability = useCallback(
    (carId, unavailableDates) => {
      if (!currentUser) return { ok: false, error: "Not signed in" };
      if (!Array.isArray(unavailableDates)) {
        return { ok: false, error: "Unavailable dates must be a list" };
      }
      if (!unavailableDates.every(isValidIsoDate)) {
        return { ok: false, error: "Invalid unavailable date" };
      }

      const car = data.cars.find((candidate) => candidate.id === carId);
      if (!car) return { ok: false, error: "Car not found" };

      const isAdmin = hasRole(currentUser, "admin");
      const isOwner = hasRole(currentUser, "owner") && car.ownerId === currentUser.id;
      if (!isAdmin && !isOwner) return { ok: false, error: "Not yours" };

      const uniqueDates = [...new Set(unavailableDates)].sort();
      const nextCars = data.cars.map((candidate) =>
        candidate.id === carId
          ? { ...candidate, unavailableDates: uniqueDates }
          : candidate,
      );

      if (!writeStorage(STORAGE_KEYS.cars, nextCars)) {
        return { ok: false, error: "Could not update availability" };
      }

      setData((previous) => ({ ...previous, cars: nextCars }));
      return { ok: true };
    },
    [currentUser, data.cars],
  );

  const createBooking = useCallback(
    ({ carId, startDate, endDate }) => {
      if (!currentUser) return { ok: false, error: "Not signed in" };
      if (!hasRole(currentUser, "renter")) {
        return { ok: false, error: "Renter access required" };
      }

      if (!isValidIsoDate(startDate) || !isValidIsoDate(endDate)) {
        return { ok: false, error: "Invalid date range" };
      }
      if (endDate < startDate) {
        return { ok: false, error: "End date cannot be before start date" };
      }
      if (startDate < todayIsoDate()) {
        return { ok: false, error: "Start date cannot be in the past" };
      }

      const car = data.cars.find((candidate) => candidate.id === carId);
      if (!car) return { ok: false, error: "Car not found" };
      if (car.status !== "approved") {
        return { ok: false, error: "Car is not available for booking" };
      }
      if (car.ownerId === currentUser.id) {
        return { ok: false, error: "You cannot book your own car" };
      }
      if (isCarUnavailable(car, startDate, endDate)) {
        return { ok: false, error: "Car is unavailable for the selected dates" };
      }
      if (hasBookingOverlap(data.bookings, carId, startDate, endDate)) {
        return { ok: false, error: "Car is already booked for the selected dates" };
      }

      const days = calculateBookingDays(startDate, endDate);
      if (!days) return { ok: false, error: "Invalid date range" };

      const totals = calculateBookingTotals(car.pricePerDay, days);
      const now = new Date().toISOString();

      const booking = {
        id: createId("booking"),
        carId,
        renterId: currentUser.id,
        ownerId: car.ownerId,
        startDate,
        endDate,
        days,
        pricePerDay: car.pricePerDay,
        subtotal: totals.subtotal,
        fee: totals.fee,
        total: totals.total,
        paymentStatus: "unpaid",
        status: "requested",
        createdAt: now,
        updatedAt: now,
      };

      const nextBookings = [booking, ...data.bookings];
      if (!writeStorage(STORAGE_KEYS.bookings, nextBookings)) {
        return { ok: false, error: "Could not save the booking" };
      }

      setData((previous) => ({ ...previous, bookings: nextBookings }));
      return { ok: true, booking };
    },
    [currentUser, data.bookings, data.cars],
  );

  const updateBookingStatus = useCallback(
    (bookingId, status) => {
      if (!currentUser) return { ok: false, error: "Not signed in" };
      if (!VALID_BOOKING_STATUSES.includes(status)) {
        return { ok: false, error: "Invalid booking status" };
      }

      const booking = data.bookings.find(
        (candidate) => candidate.id === bookingId,
      );
      if (!booking) return { ok: false, error: "Booking not found" };

      const isAdmin = hasRole(currentUser, "admin");
      const isOwner = booking.ownerId === currentUser.id;
      const isRenter = booking.renterId === currentUser.id;

      if (!isAdmin) {
        if (status === "cancelled") {
          if (!isOwner && !isRenter) return { ok: false, error: "Not yours" };
        } else if (
          ["confirmed", "declined", "in_progress", "completed"].includes(status)
        ) {
          if (!isOwner) return { ok: false, error: "Not yours" };
        } else {
          return { ok: false, error: "Not allowed" };
        }
      }

      const nextBookings = data.bookings.map((candidate) => {
        if (candidate.id !== bookingId) return candidate;

        const updated = {
          ...candidate,
          status,
          updatedAt: new Date().toISOString(),
        };

        if (status === "cancelled" && candidate.paymentStatus === "paid") {
          updated.paymentStatus = "refunded";
        }

        return updated;
      });

      if (!writeStorage(STORAGE_KEYS.bookings, nextBookings)) {
        return { ok: false, error: "Could not update the booking" };
      }

      setData((previous) => ({ ...previous, bookings: nextBookings }));
      return { ok: true };
    },
    [currentUser, data.bookings],
  );

  const cancelBooking = useCallback(
    (bookingId) => updateBookingStatus(bookingId, "cancelled"),
    [updateBookingStatus],
  );

  const value = {
    ...data,
    hydrated,
    session,
    currentUser,
    signInDemoUser,
    registerRenter,
    becomeOwner,
    signOutUser,
    createCar,
    updateCar,
    setCarStatus,
    softDeleteCar,
    setCarAvailability,
    createBooking,
    updateBookingStatus,
    cancelBooking,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useApp must be used inside an AppProvider");
  }

  return context;
}
