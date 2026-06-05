import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { parseSessionCookie, SESSION_COOKIE_NAME } from "@/lib/auth/session-cookie";
import {
  homePathForRole,
  isGuestOnlyPath,
  isProtectedPortalPath,
  resolveAuthDestination,
  roleMayAccessPortalPath,
  splitLocalePath,
} from "@/lib/auth/route-protection";

export function applyAuthMiddleware(request: NextRequest): NextResponse | null {
  const { locale, path } = splitLocalePath(request.nextUrl.pathname);
  const session = parseSessionCookie(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (isProtectedPortalPath(path)) {
    if (!session) {
      const signIn = new URL(`/${locale}/sign-in`, request.url);
      signIn.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(signIn);
    }
    if (!roleMayAccessPortalPath(session.role, path)) {
      const home = new URL(`/${locale}${homePathForRole(session.role)}`, request.url);
      return NextResponse.redirect(home);
    }
    return null;
  }

  if (isGuestOnlyPath(path) && session) {
    const callback = request.nextUrl.searchParams.get("callbackUrl");
    const destination = resolveAuthDestination(callback, session.role, null);
    return NextResponse.redirect(new URL(`/${locale}${destination}`, request.url));
  }

  return null;
}
