/**
 * Sheggar Wheels Authentication & Frontend Guardrails
 * Manages demo sessions in sessionStorage, role-aware authorization,
 * ownership checks, and the 3 required negative test defenses.
 */

import {
  STORAGE_KEYS,
  readSession,
  writeSession,
  getUserById,
  getUsers,
  isBrowser,
} from "./storage";

/* ============================================================================
   Session Management
============================================================================ */

export function getCurrentSession() {
  if (!isBrowser()) return null;
  const session = readSession(STORAGE_KEYS.SESSION, null);
  if (!session || !session.userId) return null;
  return session;
}

export function getCurrentUser() {
  const session = getCurrentSession();
  if (!session) return null;
  const user = getUserById(session.userId);
  if (!user) return null;

  return {
    ...user,
    activeRole: session.activeRole || user.roles[0] || "renter",
  };
}

export function signInAsDemo(userId, requestedRole = null) {
  if (!isBrowser()) return null;
  const user = getUserById(userId);
  if (!user) {
    console.error(`[Sheggar Wheels] User not found for ID: ${userId}`);
    return null;
  }

  if (user.status === "suspended") {
    console.warn(`[Sheggar Wheels] User ${user.name} is suspended.`);
    return { error: "Account is suspended by administrator." };
  }

  // Validate active role is permitted for this user
  let activeRole = requestedRole;
  if (!activeRole || !user.roles.includes(activeRole)) {
    activeRole = user.roles.includes("renter") ? "renter" : user.roles[0];
  }

  const session = {
    userId: user.id,
    userName: user.name,
    email: user.email,
    activeRole,
    signedInAt: new Date().toISOString(),
  };

  writeSession(STORAGE_KEYS.SESSION, session);
  return session;
}

export function switchActiveRole(newRole) {
  const session = getCurrentSession();
  if (!session) return false;
  const user = getUserById(session.userId);
  if (!user || !user.roles.includes(newRole)) return false;

  const updated = { ...session, activeRole: newRole };
  writeSession(STORAGE_KEYS.SESSION, updated);
  return true;
}

export function signOut() {
  if (!isBrowser()) return;
  writeSession(STORAGE_KEYS.SESSION, null);
  writeSession(STORAGE_KEYS.CHECKOUT_DRAFT, null);
}

/* ============================================================================
   Role & Ownership Helpers
============================================================================ */

export function hasRole(user, role) {
  if (!user || !user.roles) return false;
  return user.roles.includes(role);
}

export function isOwner(user) {
  return hasRole(user, "owner");
}

export function isAdmin(user) {
  return hasRole(user, "admin");
}

export function isRenter(user) {
  return hasRole(user, "renter");
}

/**
 * Validates internal return path
 * Satisfies Negative Test #3:
 * e.g. /signin?next=https://example.com -> safely refuses external redirect and returns fallback "/"
 */
export function safeReturnPath(value, fallback = "/") {
  if (!value || typeof value !== "string") return fallback;
  const trimmed = value.trim();

  // Reject protocol-relative URLs (//example.com) and full external URLs
  if (
    trimmed.startsWith("//") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("javascript:") ||
    trimmed.includes(":")
  ) {
    console.warn(`[Sheggar Wheels Guardrail] Blocked unsafe return URL: ${trimmed}`);
    return fallback;
  }

  // Ensure path starts with a single forward slash
  if (!trimmed.startsWith("/")) {
    return fallback;
  }

  return trimmed;
}

/* ============================================================================
   Negative Test Guardrails & Permission Checks
============================================================================ */

/**
 * Negative Test #1:
 * Signed-out write attempt: checks that a booking/action cannot proceed without active session
 */
export function assertAuthenticated() {
  const session = getCurrentSession();
  if (!session || !session.userId) {
    return {
      allowed: false,
      error: "Not signed in. Please sign in to request a booking.",
    };
  }
  const user = getUserById(session.userId);
  if (user?.status === "suspended") {
    return {
      allowed: false,
      error: "Your account has been suspended by the platform administrator.",
    };
  }
  return { allowed: true, user, session };
}

/**
 * Negative Test #2:
 * Cross-user ownership attempt:
 * - A renter cannot cancel or view another renter's booking
 * - An owner cannot edit or manage another owner's vehicle
 */
export function assertBookingOwnership(booking, requiredAction = "view") {
  const auth = assertAuthenticated();
  if (!auth.allowed) return auth;

  const { user } = auth;
  // Admins have platform-wide access
  if (isAdmin(user)) return { allowed: true, user };

  if (requiredAction === "view") {
    if (booking.renterId !== user.id && booking.ownerId !== user.id) {
      console.warn(`[Sheggar Wheels Guardrail] Blocked unauthorized booking view for ${user.id}`);
      return { allowed: false, error: "Not yours. You cannot view bookings that belong to another user." };
    }
  }

  if (requiredAction === "cancel" || requiredAction === "review") {
    if (booking.renterId !== user.id) {
      console.warn(`[Sheggar Wheels Guardrail] Blocked cross-user booking access for ${user.id}`);
      return { allowed: false, error: "Not yours. You cannot modify bookings that belong to another renter." };
    }
  }

  if (requiredAction === "approve" || requiredAction === "decline") {
    if (booking.ownerId !== user.id) {
      console.warn(`[Sheggar Wheels Guardrail] Blocked cross-owner booking action for ${user.id}`);
      return { allowed: false, error: "Not yours. You do not own the vehicle for this booking." };
    }
  }

  return { allowed: true, user };
}

export function assertCarOwnership(car) {
  const auth = assertAuthenticated();
  if (!auth.allowed) return auth;

  const { user } = auth;
  if (isAdmin(user)) return { allowed: true, user };

  if (car.ownerId !== user.id) {
    console.warn(`[Sheggar Wheels Guardrail] Blocked cross-owner car modification: ${car.id} by ${user.id}`);
    return { allowed: false, error: "Not yours. You do not have permission to edit this vehicle." };
  }

  return { allowed: true, user };
}
