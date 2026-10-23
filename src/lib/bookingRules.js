// lib/bookingRules.js
// Small pure helpers for booking validation. Keeping these separate makes the
// rules easy to understand and easy to verify without a browser.

export const BLOCKING_BOOKING_STATUSES = [
  'requested',
  'confirmed',
  'in_progress',
  'disputed',
];

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Checks that a value is a real YYYY-MM-DD date.
 */
export function isValidIsoDate(value) {
  if (typeof value !== 'string' || !ISO_DATE_PATTERN.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

/**
 * Gets today's date in the browser's local timezone as YYYY-MM-DD.
 */
export function todayIsoDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns the number of rental days for a date range.
 * Pickup is inclusive and return is exclusive. Same-day and reversed
 * ranges are invalid.
 */
export function calculateBookingDays(startDate, endDate) {
  if (!isValidIsoDate(startDate) || !isValidIsoDate(endDate)) {
    return null;
  }

  const start = Date.parse(`${startDate}T00:00:00Z`);
  const end = Date.parse(`${endDate}T00:00:00Z`);

  if (end <= start) {
    return null;
  }

  return Math.round((end - start) / 86400000);
}

/**
 * Returns true when two half-open date ranges share at least one day.
 */
export function dateRangesOverlap(startA, endA, startB, endB) {
  if (
    !isValidIsoDate(startA) ||
    !isValidIsoDate(endA) ||
    !isValidIsoDate(startB) ||
    !isValidIsoDate(endB)
  ) {
    return false;
  }

  return startA < endB && startB < endA;
}

/**
 * Returns true when any blocked date falls inside the requested
 * half-open range.
 */
export function isCarUnavailable(car, startDate, endDate) {
  if (
    !car ||
    !Array.isArray(car.unavailableDates) ||
    !isValidIsoDate(startDate) ||
    !isValidIsoDate(endDate) ||
    endDate <= startDate
  ) {
    return false;
  }

  return car.unavailableDates.some(
    (date) => isValidIsoDate(date) && date >= startDate && date < endDate,
  );
}

/**
 * Returns true when another active booking overlaps the requested range.
 */
export function hasBookingOverlap(bookings, carId, startDate, endDate) {
  return bookings.some(
    (booking) =>
      booking.carId === carId &&
      BLOCKING_BOOKING_STATUSES.includes(booking.status) &&
      dateRangesOverlap(startDate, endDate, booking.startDate, booking.endDate),
  );
}

/**
 * Calculates the price snapshot stored on a booking.
 */
export function calculateBookingTotals(pricePerDay, days) {
  const subtotal = pricePerDay * days;
  const fee = Math.round(subtotal * 0.05);

  return {
    subtotal,
    fee,
    total: subtotal + fee,
  };
}
