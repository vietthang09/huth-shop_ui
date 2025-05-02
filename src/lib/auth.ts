import { getServerSession } from "next-auth/next";
import { authOptions } from "./authOptions";

export const auth = () => getServerSession(authOptions);
