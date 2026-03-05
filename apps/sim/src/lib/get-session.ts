import { getAuth } from "./auth";

/**
 * Extracts and verifies the session from request headers.
 * Returns the session (with user) or null if missing/invalid.
 * Used by all API route handlers to guard access and get userId.
 */
export async function getSession(headers: Headers) {
  return getAuth().api.getSession({ headers });
}
