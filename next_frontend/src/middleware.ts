import { NextRequest, NextResponse } from "next/server";

// Routes that require the user to be logged in
const PROTECTED_PATHS = ["/shop", "/pricing", "/orders", "/cart", "/create-store"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (!isProtected) return NextResponse.next();

  // Check for auth token stored as a cookie
  const token = request.cookies.get("novacart_token")?.value;

  if (!token) {
    // Redirect to login and preserve the intended destination
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Match all paths except Next.js internals and static files
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
};
