
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET
);

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Public admin pages and authentication APIs
  if (
    pathname === "/admin/login" ||
    pathname === "/admin/logout" ||
    pathname === "/api/admin/login"
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("admin_token")?.value;

  if (!token) {
    return NextResponse.redirect(
      new URL("/admin/login", request.url)
    );
  }

  try {
    const { payload } = await jwtVerify(token, secret);

    // ============================================
    // MAIN ADMIN ONLY
    // ============================================
    // These frontend admin sections are completely
    // inaccessible to moderators.
    //
    // /admin/admins
    // /admin/apartments
    // /admin/apartments/...
    // ============================================

    const mainAdminOnly =
      pathname === "/admin/admins" ||
      pathname.startsWith("/admin/apartments");

    if (mainAdminOnly && payload?.role !== "main") {
return NextResponse.rewrite(
  new URL("/__not-found", request.url)
);
    }

    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(
      new URL("/admin/login", request.url)
    );

    response.cookies.delete("admin_token");

    return response;
  }
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
