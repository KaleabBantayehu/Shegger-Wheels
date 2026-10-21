// lib/storage.js
import { INITIAL_USERS, INITIAL_CARS, INITIAL_BOOKINGS } from './seedData';
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


export function initializeDemoData() {
    if (typeof window === "undefined") return;

    if(window.localStorage.getItem("sw_users_v1") === null) {
        writeStorage("sw_users_v1", INITIAL_USERS)
    }

    if(window.localStorage.getItem("sw_cars_v1") === null) {
        writeStorage("sw_cars_v1", INITIAL_CARS)
    }
    
    if(window.localStorage.getItem("sw_bookings_v1" === null)){
        writeStorage("sw_bookings_v1", INITIAL_BOOKINGS)
    }
}

export function resetDemoData() {
  if (typeof window === "undefined") return;

  writeStorage("sw_users_v1", INITIAL_USERS);
  writeStorage("sw_cars_v1", INITIAL_CARS);
  writeStorage("sw_bookings_v1", INITIAL_BOOKINGS);
  removeStorage("sw_reviews_v1");
  removeStorage("sw_disputes_v1");
  removeStorage("sw_session_v1", "sessionStorage");
}