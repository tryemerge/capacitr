import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDirectDb } from "@capacitr/database";
import * as schema from "@capacitr/database/schema";

function getAllowedEmails() {
  return new Set(
    (process.env.ALLOWED_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean)
  );
}

function createAuth() {
  return betterAuth({
    baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3001",
    database: drizzleAdapter(getDirectDb(), {
      provider: "pg",
      schema,
    }),
    secret: process.env.SESSION_SECRET,
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            const allowed = getAllowedEmails();
            if (allowed.size > 0 && !allowed.has(user.email)) {
              throw new Error("Access denied: your email is not on the allowlist.");
            }
          },
        },
      },
    },
  });
}

let _auth: ReturnType<typeof createAuth> | undefined;

export function getAuth() {
  if (!_auth) _auth = createAuth();
  return _auth!;
}

export type Auth = ReturnType<typeof createAuth>;
