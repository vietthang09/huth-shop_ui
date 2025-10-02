import { NextRequest, NextResponse } from "next/server";
import type { AuthState } from "@/store/authStore";

function getAuthFromStore(request: NextRequest): AuthState {
  try {
    const authStoreCookie = request.cookies.get("auth-store")?.value;

    if (authStoreCookie) {
      const parsedStore = JSON.parse(decodeURIComponent(authStoreCookie));
      return parsedStore.state || parsedStore;
    }
  } catch (error) {
    console.error("Error parsing auth store in middleware:", error);
  }

  return { user: null, accessToken: null };
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const authState = getAuthFromStore(request);
  const { user, accessToken } = authState;

  const adminRoutes = ["/portal"];
  const userRoutes = ["/user"];
  const storeRoutes = ["/store"];
  const authRoutes = ["/dang-nhap", "/auth", "/login"];

  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route)) || pathname.includes("(admin)");

  const isUserRoute = userRoutes.some((route) => pathname.startsWith(route)) || pathname.includes("(user)");

  const isStoreRoute = storeRoutes.some((route) => pathname.startsWith(route)) || pathname.includes("(store)");

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route)) || pathname.includes("(auth)");

  if ((accessToken || user) && isAuthRoute) {
    const userRole = user?.role?.toLowerCase();
    if (userRole === "admin") {
      return NextResponse.redirect(new URL("/portal", request.url));
    } else if (userRole === "user") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (!accessToken && !user) {
    if (isAdminRoute || isUserRoute || isStoreRoute) {
      const loginUrl = new URL("/dang-nhap", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  const userRole = user?.role?.toLowerCase();

  if (isAdminRoute) {
    if (userRole !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (isUserRoute) {
    if (userRole !== "user") {
      if (userRole === "admin") {
        return NextResponse.redirect(new URL("/portal", request.url));
      }
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (isStoreRoute) {
    if (userRole !== "admin" && userRole !== "user") {
      return NextResponse.redirect(new URL("/dang-nhap", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public|icons|images).*)"],
};
