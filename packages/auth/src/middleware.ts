import { NextRequest, NextResponse } from "next/server";

export function createPrivyMiddleware(
  loginPath = "/login",
  homePath = "/home"
) {
  return function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const privyToken = request.cookies.get("privy-token")?.value;

    // If we have a token, we can do server-side redirects
    if (privyToken) {
      // Logged-in user on login page → send to home
      if (pathname === loginPath) {
        return NextResponse.redirect(new URL(homePath, request.url));
      }
      return NextResponse.next();
    }

    // No token — could be HTTP (local dev) where Privy doesn't set cookies.
    // Only redirect if we're confident the user is unauthenticated,
    // i.e. the cookie is absent AND we're on HTTPS (production).
    const isHttps = request.nextUrl.protocol === "https:";
    if (isHttps && pathname !== loginPath) {
      return NextResponse.redirect(new URL(loginPath, request.url));
    }

    // On HTTP (local dev), let the client-side AuthGuard / ProtectedRoute handle it
    return NextResponse.next();
  };
}

export const privyAuthMiddleware = createPrivyMiddleware();
