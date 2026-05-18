import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Route protection at the network boundary (Next.js 16 `proxy.ts`, formerly
 * `middleware.ts`). Runs before the page renders, so unauth'd users hitting
 * `/dashboard/*` or `/team/*` are bounced to `/login`, and already-signed-in
 * users hitting `/login`/`/register` are sent home — neither group ever
 * sees a flash of the wrong screen.
 *
 * Authoritative check is the better-auth session cookie. For this to work,
 * the cookie must be on the frontend origin — `next.config.ts` proxies
 * `/api/*` to the upstream API so that's the case. Without that proxy the
 * cookie lives on the API origin and is invisible here.
 *
 * AuthGuard still runs after this and hydrates the in-memory store from
 * localStorage; the proxy only decides "may this request proceed?".
 */

const AUTH_ROUTES = new Set(["/login", "/register"]);

function isProtectedPath(pathname: string): boolean {
  return pathname.startsWith("/dashboard") || pathname.startsWith("/team");
}

/** Only same-origin relative paths are allowed as a post-auth redirect. */
function safeNext(raw: string | null): string {
  if (!raw) return "/dashboard";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/dashboard";
  return raw;
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const sessionCookie = getSessionCookie(request);

  if (sessionCookie && AUTH_ROUTES.has(pathname)) {
    const next = safeNext(request.nextUrl.searchParams.get("next"));
    return NextResponse.redirect(new URL(next, request.url));
  }

  if (!sessionCookie && isProtectedPath(pathname)) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/team/:path*",
    "/login",
    "/register",
  ],
};
