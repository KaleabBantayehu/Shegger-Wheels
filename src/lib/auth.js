// lib/auth.js
import { readStorage, writeStorage, removeStorage } from './storage';

const SESSION_KEY = 'sw_session_v1';
const USERS_KEY = 'sw_users_v1';

/**
 * Reads the active demo session from sessionStorage.
 * @returns {object|null} The session object { userId, signedInAt } or null if guest.
 */
export function getCurrentSession() {
  return readStorage(SESSION_KEY, null, 'sessionStorage');
}

/**
 * Retrieves the currently signed-in user record by looking up the session's userId in localStorage.
 * @returns {object|null} The full User object or null if signed out / missing user.
 */
export function getCurrentUser() {
  const session = getCurrentSession();
  if (!session || !session.userId) {
    return null;
  }

  const users = readStorage(USERS_KEY, []);
  const activeUser = users.find((user) => user.id === session.userId);

  // Guard against suspended accounts
  if (activeUser && activeUser.status === 'suspended') {
    return null;
  }

  return activeUser || null;
}

/**
 * Signs in a demo user by setting their ID in sessionStorage.
 * @param {string} userId - The ID of the demo account to sign in as.
 * @returns {boolean} True if sign-in succeeded.
 */
export function signInAsDemo(userId) {
  const sessionData = {
    userId,
    signedInAt: new Date().toISOString(),
  };

  return writeStorage(SESSION_KEY, sessionData, 'sessionStorage');
}

/**
 * Signs out the current user by removing session state from sessionStorage.
 */
export function signOut() {
  removeStorage(SESSION_KEY, 'sessionStorage');
}

/**
 * Checks if a given user object possesses a specific role.
 * @param {object|null} user - The user record.
 * @param {string} role - e.g., 'renter', 'owner', or 'admin'.
 * @returns {boolean}
 */
export function hasRole(user, role) {
  if (!user || !Array.isArray(user.roles)) {
    return false;
  }
  return user.roles.includes(role);
}

/**
 * Validates return paths for sign-in redirects to prevent open redirect vulnerabilities.
 * Strips external absolute domain names (e.g., https://example.com) and defaults to safe path '/'.
 * @param {string|null} path - The candidate return path parameter (e.g., "?next=/checkout").
 * @returns {string} Safe internal relative path (e.g., "/checkout" or "/").
 */
export function safeReturnPath(path) {
  if (!path || typeof path !== 'string') {
    return '/';
  }

  // Reject absolute URLs (e.g., http://, https://, //)
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//')) {
    return '/';
  }

  // Ensure path starts with a relative slash
  return path.startsWith('/') ? path : `/${path}`;
}