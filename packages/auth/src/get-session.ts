import { getPrivy } from "./privy-client";
import { getDb } from "@capacitr/database";
import { user } from "@capacitr/database/schema";
import { eq } from "drizzle-orm";

function parseCookie(cookieHeader: string, name: string): string | undefined {
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match?.[1];
}

/**
 * Verifies the Privy access token and returns { user: { id, name, email } }
 * or null. Upserts the user row on first login.
 */
export async function getSession(headers: Headers) {
  const accessToken = parseCookie(headers.get("cookie") ?? "", "privy-token");
  if (!accessToken) return null;

  let privyUserId: string;
  try {
    const claims = await getPrivy().verifyAuthToken(accessToken);
    privyUserId = claims.userId;
  } catch {
    return null;
  }

  const db = getDb();
  const [existing] = await db
    .select({ id: user.id, name: user.name, email: user.email })
    .from(user)
    .where(eq(user.id, privyUserId));

  if (existing) {
    return { user: existing };
  }

  // First login — try identity token for profile info
  const idToken = parseCookie(headers.get("cookie") ?? "", "privy-id-token");

  let email = `${privyUserId}@privy.local`;
  let name = privyUserId;

  if (idToken) {
    try {
      const privyUser = await getPrivy().getUser({ idToken });
      if (privyUser.email?.address) {
        email = privyUser.email.address;
        name = email.split("@")[0];
      }
    } catch {
      // Fall through with defaults
    }
  }

  const [created] = await db
    .insert(user)
    .values({
      id: privyUserId,
      name,
      email,
      emailVerified: email !== `${privyUserId}@privy.local`,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoNothing({ target: user.id })
    .returning();

  if (created) {
    return { user: { id: created.id, name: created.name, email: created.email } };
  }

  // Race condition — another request created it first
  const [raced] = await db
    .select({ id: user.id, name: user.name, email: user.email })
    .from(user)
    .where(eq(user.id, privyUserId));

  return raced ? { user: raced } : null;
}
