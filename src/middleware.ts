import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = (req as any).nextauth?.token;
    const path = req.nextUrl.pathname;

    // Allow unauthenticated access to login pages
    if (path === "/admin/login" || path === "/bar/login" || path === "/login") {
      return NextResponse.next();
    }

    if (path.startsWith("/dashboard") && token?.role !== "BAR_MANAGER" && token?.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    if (path.startsWith("/admin") && token?.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: { authorized: ({ token, req }) => {
      // Allow login pages without auth
      const path = req?.nextUrl?.pathname;
      if (path === "/admin/login" || path === "/bar/login" || path === "/login") {
        return true;
      }
      return !!token;
    }},
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/bar/:path*"],
};
