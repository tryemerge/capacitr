import { createPrivyMiddleware } from "@capacitr/auth/middleware"

export const middleware = createPrivyMiddleware("/", "/home")

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon-|apple-icon|api/auth).*)"],
}
