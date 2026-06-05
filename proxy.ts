import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { applyAuthMiddleware } from "@/lib/auth/auth-middleware";
import { routing } from "@/lib/i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const authRedirect = applyAuthMiddleware(request);
  if (authRedirect) {
    return authRedirect;
  }
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
