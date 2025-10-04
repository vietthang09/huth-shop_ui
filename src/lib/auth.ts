import { getServerSession } from "next-auth/next";
import { authConfig } from "../app/api/auth/auth.config";

export function auth() {
  return getServerSession(authConfig);
}
