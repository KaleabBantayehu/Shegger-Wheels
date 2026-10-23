// lib/auth.js
import {
  readStorage,
  writeStorage,
  removeStorage,
  STORAGE_KEYS,
} from './storage';

const SESSION_KEY = STORAGE_KEYS.session;
const USERS_KEY = STORAGE_KEYS.users;

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

export function signInAsDemoUser(userId) {
  const users = readStorage(USERS_KEY, []);
  const user = Array.isArray(users) ? users.find((candidate) => candidate.id === userId) : null;

  if (!user) return { ok: false, error: 'That demo account is not available' };
  if (user.status === 'suspended') return { ok: false, error: 'This demo account is suspended' };

  return signInAsDemo(user.id)
    ? { ok: true, user }
    : { ok: false, error: 'Could not start the demo session' };
}

export function registerUser({ name, email, phone = '' }) {
  const normalizedName = typeof name === 'string' ? name.trim() : '';
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!normalizedName || !normalizedEmail) {
    return { ok: false, error: 'Name and email are required' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return { ok: false, error: 'Enter a valid email address' };
  }
  const users = readStorage(USERS_KEY, []);
  if (!Array.isArray(users)) return { ok: false, error: 'Account data is unavailable' };
  if (users.some((user) => user.email?.toLowerCase() === normalizedEmail)) {
    return { ok: false, error: 'An account with that email already exists' };
  }

  const user = {
    id: `user-${typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now()}`,
    name: normalizedName,
    email: normalizedEmail,
    phone: String(phone || '').trim(),
    roles: ['renter'],
    status: 'active',
    createdAt: new Date().toISOString(),
  };
  if (!writeStorage(USERS_KEY, [user, ...users])) {
    return { ok: false, error: 'Could not create the account' };
  }

  return signInAsDemo(user.id)
    ? { ok: true, user }
    : { ok: false, error: 'Could not start the demo session' };
}

export function addOwnerRole(userId) {
  const users = readStorage(USERS_KEY, []);
  if (!Array.isArray(users)) return { ok: false, error: 'Account data is unavailable' };

  const user = users.find((candidate) => candidate.id === userId);
  if (!user) return { ok: false, error: 'User not found' };
  if (user.status === 'suspended') return { ok: false, error: 'This account is suspended' };
  if (hasRole(user, 'admin')) return { ok: false, error: 'Admin accounts cannot change workspace roles' };

  const roles = Array.isArray(user.roles) ? user.roles : [];
  const nextUser = { ...user, roles: roles.includes('owner') ? roles : [...roles, 'owner'] };
  const nextUsers = users.map((candidate) => candidate.id === userId ? nextUser : candidate);
  if (!writeStorage(USERS_KEY, nextUsers)) return { ok: false, error: 'Could not update the account' };
  return { ok: true, user: nextUser };
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
 * Validates return paths for sign-in redirects to prevent open redirects.
 *
 * Only a local application path such as "/cars?q=Toyota" is allowed.
 * External URLs, protocol-relative URLs, backslash variants, control
 * characters, malformed encodings, and sign-in loops fall back to "/".
 *
 * @param {string|null} path - The candidate return path parameter.
 * @returns {string} Safe local path, or "/".
 */
export function safeReturnPath(path) {
  if (typeof path !== 'string') {
    return '/';
  }

  let candidate = path.trim();
  if (!candidate || candidate.length > 2048 || candidate.includes('\uFFFD')) {
    return '/';
  }

  // Reject backslashes and control characters before any decoding.
  if (/[\\\u0000-\u001F\u007F]/.test(candidate)) {
    return '/';
  }

  // Decode repeatedly so double-encoded separators cannot slip through.
  // Malformed percent encoding throws and is rejected.
  let decoded = candidate;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    let nextValue;
    try {
      nextValue = decodeURIComponent(decoded);
    } catch {
      return '/';
    }

    if (nextValue === decoded) break;
    decoded = nextValue;

    if (/[\\\u0000-\u001F\u007F\uFFFD]/.test(decoded) || decoded.startsWith('//')) {
      return '/';
    }
  }

  // A safe application path must start with exactly one forward slash.
  if (!decoded.startsWith('/') || decoded.startsWith('//')) {
    return '/';
  }

  try {
    const baseUrl = 'http://local.invalid';
    const parsed = new URL(decoded, baseUrl);

    if (parsed.origin !== baseUrl || parsed.username || parsed.password) {
      return '/';
    }
    if (!parsed.pathname.startsWith('/') || parsed.pathname.startsWith('//')) {
      return '/';
    }

    // Never send a successful sign-in back to the sign-in page.
    if (parsed.pathname === '/signin' || parsed.pathname.startsWith('/signin/')) {
      return '/';
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return '/';
  }
}