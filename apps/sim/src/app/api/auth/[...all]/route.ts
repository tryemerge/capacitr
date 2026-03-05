import { getAuth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Lazy handler — avoids getDb() call at module init during Next.js build
let _handler: ReturnType<typeof toNextJsHandler> | undefined;
function handler() {
  if (!_handler) _handler = toNextJsHandler(getAuth());
  return _handler;
}

export function GET(req: Request) {
  return handler().GET(req);
}

export function POST(req: Request) {
  return handler().POST(req);
}
