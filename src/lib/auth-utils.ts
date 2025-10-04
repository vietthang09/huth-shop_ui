import { redirect } from "next/navigation";
import { getSession } from "next-auth/react";
import { auth } from "@/lib/auth";

export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    redirect("/dang-nhap");
  }

  return session;
}

export async function requireRole(role: string) {
  const session = await requireAuth();

  if (session.user.role !== role) {
    redirect("/unauthorized");
  }

  return session;
}

export async function requireAdmin() {
  return requireRole("admin");
}

// Get token on the server side
export async function getServerToken() {
  try {
    const session = await auth();
    return session?.accessToken || null;
  } catch (error) {
    console.error("Failed to get server session:", error);
    return null;
  }
}

// Get token on the client side
export async function getClientToken() {
  try {
    const session = await getSession();
    return session?.accessToken || null;
  } catch (error) {
    console.error("Failed to get client session:", error);
    return null;
  }
}

// Universal token getter that works on both client and server
export async function getToken() {
  if (typeof window === "undefined") {
    // Server side
    return await getServerToken();
  } else {
    // Client side
    return await getClientToken();
  }
}
