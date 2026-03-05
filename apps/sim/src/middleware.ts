import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = getSessionCookie(request);

  // Authenticated user visiting /login → send them home
  if (pathname === "/login" && sessionCookie) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Unauthenticated user visiting a protected route → send to login
  if (pathname !== "/login" && !sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files, _next internals, and auth API
    "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
  ],
};
