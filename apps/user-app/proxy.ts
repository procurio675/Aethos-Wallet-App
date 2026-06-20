import { NextRequest, NextResponse } from "next/server";

// Public routes — no auth required
const PUBLIC_PATHS = ["/", "/auth/signin", "/auth/signup"];

export function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Allow public paths through immediately
  if (PUBLIC_PATHS.includes(pathname) || pathname.startsWith("/auth")) {
    return NextResponse.next();
  }

  // For all other routes, check for session cookie
  const sessionToken =
    req.cookies.get("next-auth.session-token")?.value ||
    req.cookies.get("__Secure-next-auth.session-token")?.value;

  if (!sessionToken) {
    const signinUrl = new URL("/auth/signin", req.url);
    signinUrl.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(signinUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
