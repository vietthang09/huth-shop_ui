import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      fullname?: string | null;
      email: string | null;
      role: string;
    };
  }

  interface User {
    id: number;
    fullname?: string | null;
    email: string | null;
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: number;
    role: string;
  }
}
