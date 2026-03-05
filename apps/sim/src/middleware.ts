import { privyAuthMiddleware } from "@capacitr/auth/middleware";

export const middleware = privyAuthMiddleware;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
  ],
};
