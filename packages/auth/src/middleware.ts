import { NextRequest, NextResponse } from "next/server";

export function createPrivyMiddleware(loginPath = "/login") {
  return function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const privyToken = request.cookies.get("privy-token")?.value;

    if (pathname === loginPath && privyToken) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (pathname !== loginPath && !privyToken) {
      return NextResponse.redirect(new URL(loginPath, request.url));
    }

    return NextResponse.next();
  };
}

export const privyAuthMiddleware = createPrivyMiddleware();
