import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith("/auth");
    const isPublicPage =
      req.nextUrl.pathname === "/" || req.nextUrl.pathname === "/register";

    // Redirect authenticated users away from auth pages
    if (isAuthPage && isAuth) {
      return NextResponse.redirect(new URL("/cp", req.url));
    }

    // Redirect unauthenticated users to login (except for public pages)
    if (!isAuth && !isAuthPage && !isPublicPage) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    // Role-based access control for admin routes
    if (req.nextUrl.pathname.startsWith("/cp")) {
      // Add role-based restrictions here if needed
      // For example: if (token?.role !== "admin") { return NextResponse.redirect(...) }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // This runs before the middleware function
        // Return true to continue, false to redirect to sign-in
        return true; // We handle redirects in the middleware function above
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
