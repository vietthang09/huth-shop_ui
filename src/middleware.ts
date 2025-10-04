import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";

export default withAuth(
  async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Get the token from NextAuth
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    const user = token
      ? {
          id: token.sub,
          email: token.email,
          name: token.name,
          role: token.role,
        }
      : null;

    const isAuthenticated = !!token;

    const adminRoutes = ["/portal"];
    const userRoutes = ["/user"];
    const storeRoutes = ["/store"];
    const authRoutes = ["/dang-nhap", "/auth", "/login"];

    const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route)) || pathname.includes("(admin)");
    const isUserRoute = userRoutes.some((route) => pathname.startsWith(route)) || pathname.includes("(user)");
    const isStoreRoute = storeRoutes.some((route) => pathname.startsWith(route)) || pathname.includes("(store)");
    const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route)) || pathname.includes("(auth)");

    // Redirect authenticated users away from auth pages
    if (isAuthenticated && isAuthRoute) {
      const userRole = user?.role?.toLowerCase();
      if (userRole === "admin") {
        return NextResponse.redirect(new URL("/portal", request.url));
      } else if (userRole === "user") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    // Protect routes that require authentication
    if (!isAuthenticated) {
      if (isAdminRoute || isUserRoute || isStoreRoute) {
        const loginUrl = new URL("/dang-nhap", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }
      return NextResponse.next();
    }

    const userRole = user?.role?.toLowerCase();

    // Protect admin routes
    if (isAdminRoute) {
      if (userRole !== "admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    // Protect user routes
    if (isUserRoute) {
      if (userRole !== "user") {
        if (userRole === "admin") {
          return NextResponse.redirect(new URL("/portal", request.url));
        }
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    // Protect store routes
    if (isStoreRoute) {
      if (userRole !== "admin" && userRole !== "user") {
        return NextResponse.redirect(new URL("/dang-nhap", request.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true, // We handle authorization in the middleware function
    },
  }
);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public|icons|images).*)"],
};
