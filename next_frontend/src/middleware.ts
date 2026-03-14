import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS    = ["/", "/login", "/shop", "/product", "/pricing"];
const VENDOR_PATHS    = ["/store", "/market"];
const ADMIN_PATHS     = ["/admin"];
const DELIVERY_PATHS  = ["/delivery"];
const PROTECTED_PATHS = ["/orders", "/cart", "/create-store", ...VENDOR_PATHS, ...ADMIN_PATHS, ...DELIVERY_PATHS];

/** Decode JWT payload from base64 without a library */
function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(Buffer.from(base64, "base64").toString("utf-8")) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get("novacart_token")?.value;

  // No token → redirect to login with return URL
  if (!token) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const payload = decodeJwtPayload(token);
  const role = (payload.role as string) ?? "user";

  const isVendor = Boolean(payload.isVendor);
  const isDelivery = Boolean(payload.isDelivery);
  const isServiceProvider = Boolean(payload.isServiceProvider);

  // Admin-only paths
  if (ADMIN_PATHS.some((p) => pathname.startsWith(p)) && role !== "admin") {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", pathname);
    loginUrl.searchParams.set("reason", "admin_required");
    return NextResponse.redirect(loginUrl);
  }

  // Vendor-only paths (admin also allowed)
  if (VENDOR_PATHS.some((p) => pathname.startsWith(p)) && !isVendor && role !== "admin") {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", pathname);
    loginUrl.searchParams.set("reason", "vendor_required");
    return NextResponse.redirect(loginUrl);
  }

  // Delivery-only paths (admin also allowed)
  if (DELIVERY_PATHS.some((p) => pathname.startsWith(p)) && !isDelivery && role !== "admin") {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", pathname);
    loginUrl.searchParams.set("reason", "delivery_required");
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.webp|.*\\.jpg).*)"],
};
