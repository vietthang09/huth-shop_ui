import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      fullname?: string | null;
      email: string | null;
      role: string | null; // Add role here
    };
  }
}
