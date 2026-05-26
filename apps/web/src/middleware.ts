import { COOKIE_NAME } from "@/lib/auth";
import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";

const protectedPaths = ["/dashboard"];
const demoBoardPath = "/boards/demo-product-launch";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected =
    protectedPaths.some((p) => pathname.startsWith(p)) ||
    (pathname.startsWith("/boards/") && pathname !== demoBoardPath);

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const secret = process.env.JWT_SECRET;

  if (!token || !secret) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/boards/:path*"],
};
