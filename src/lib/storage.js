// lib/storage.js
import { INITIAL_USERS, INITIAL_CARS, INITIAL_BOOKINGS } from './seedData';

/**
 * Every browser-storage key used by the demo application.
 * Keeping the names here prevents pages and helpers from inventing their own keys.
 */
export const STORAGE_KEYS = {
  users: 'sw_users_v1',
  cars: 'sw_cars_v1',
  bookings: 'sw_bookings_v1',
  reviews: 'sw_reviews_v1',
  disputes: 'sw_disputes_v1',
  announcements: 'sw_announcements_v1',
  session: 'sw_session_v1',
  checkoutDraft: 'sw_checkout_draft_v1',
};

// These keys live in localStorage and survive a browser restart.
const LOCAL_STORAGE_KEYS = [
  STORAGE_KEYS.users,
  STORAGE_KEYS.cars,
  STORAGE_KEYS.bookings,
  STORAGE_KEYS.reviews,
  STORAGE_KEYS.disputes,
  STORAGE_KEYS.announcements,
];

// These keys live in sessionStorage and end when the tab closes.
const SESSION_STORAGE_KEYS = [
  STORAGE_KEYS.session,
  STORAGE_KEYS.checkoutDraft,
];

/**
 * Initial records for the demo.
 *
 * Reviews, disputes, and announcements are part of the documented data model
 * but currently have no seed records, so they start as empty arrays.
 */
const DEMO_SEEDS = [
  [STORAGE_KEYS.users, INITIAL_USERS],
  [STORAGE_KEYS.cars, INITIAL_CARS],
  [STORAGE_KEYS.bookings, INITIAL_BOOKINGS],
  [STORAGE_KEYS.reviews, []],
  [STORAGE_KEYS.disputes, []],
  [STORAGE_KEYS.announcements, []],
];

/**
 * Safely reads and parses JSON data from browser storage (localStorage or sessionStorage).
 * @param {string} key - The storage key (e.g., 'sw_cars_v1')
 * @param {any} fallback - Default value returned if key is missing or invalid
 * @param {string} storageType - 'localStorage' or 'sessionStorage' (defaults to 'localStorage')
 * @returns {any}
 */
export function readStorage(key, fallback, storageType = 'localStorage') {
  // 1. Guard clause for Next.js Server-Side Rendering (SSR)
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const storage = window[storageType];
    const item = storage.getItem(key);
    
    // Return fallback if key doesn't exist in browser storage
    if (item === null) {
      return fallback;
    }

    // Parse JSON string back into a JavaScript object/array
    return JSON.parse(item);
  } catch (error) {
    console.warn(`Error reading ${storageType} key "${key}":`, error);
    return fallback; // Prevents app crash if stored string is malformed
  }
}

/**
 * Safely serializes and writes data to browser storage.
 * @param {string} key - The storage key
 * @param {any} value - JavaScript object/array/value to store
 * @param {string} storageType - 'localStorage' or 'sessionStorage' (defaults to 'localStorage')
 * @returns {boolean} - Returns true if successful, false if failed
 */
export function writeStorage(key, value, storageType = 'localStorage') {
  // 1. Guard clause for SSR
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const storage = window[storageType];
    // Convert JavaScript object/array into a string representation
    const serializedValue = JSON.stringify(value);
    storage.setItem(key, serializedValue);
    return true;
  } catch (error) {
    console.error(`Error writing to ${storageType} key "${key}":`, error);
    return false; // Handles storage quota full errors safely
  }
}

/**
 * Removes a key from browser storage.
 * @param {string} key 
 * @param {string} storageType 
 */
export function removeStorage(key, storageType = 'localStorage') {
  if (typeof window === "undefined") return;
  
  try {
    window[storageType].removeItem(key);
  } catch (error) {
    console.error(`Error removing ${storageType} key "${key}":`, error);
  }
}

/**
 * Returns true when a stored value exists and is valid JSON.
 * A malformed value should be repaired with demo data instead of crashing the app.
 */
function hasValidStoredJson(key) {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return false;
    JSON.parse(raw);
    return true;
  } catch {
    return false;
  }
}

/**
 * Seeds demo data on first browser load.
 *
 * This function is idempotent:
 * - Missing keys are filled with seed data.
 * - Malformed JSON is repaired with seed data.
 * - Valid existing data is never overwritten, so user changes survive reloads.
 */
export function initializeDemoData() {
  if (typeof window === "undefined") return;

  for (const [key, seedValue] of DEMO_SEEDS) {
    if (!hasValidStoredJson(key)) {
      writeStorage(key, seedValue);
    }
  }
}

/**
 * Clears every documented app key and restores the original demo data.
 * The active demo session and any checkout draft are intentionally cleared too.
 */
export function resetDemoData() {
  if (typeof window === "undefined") return;

  for (const key of LOCAL_STORAGE_KEYS) {
    removeStorage(key, 'localStorage');
  }

  for (const key of SESSION_STORAGE_KEYS) {
    removeStorage(key, 'sessionStorage');
  }

  initializeDemoData();
}
