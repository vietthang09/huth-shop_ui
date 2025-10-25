import CredentialsProvider from "next-auth/providers/credentials";
import type { AuthOptions } from "next-auth";
import { login } from "@/services/auth";

export const authConfig: AuthOptions = {
  providers: [
    // Credentials Provider for custom authentication
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ NextAuth: Missing credentials");
          return null;
        }

        try {
          console.log("🔐 NextAuth: Attempting to authenticate user:", credentials.email);
          const authResult = await authenticateUser(credentials.email, credentials.password);

          if (authResult && authResult.user) {
            console.log("✅ NextAuth: User authenticated successfully:", authResult.user.email);
            const user = {
              id: authResult.user.id.toString(),
              email: authResult.user.email,
              name: authResult.user.firstName,
              role: authResult.user.role,
              accessToken: authResult.access_token,
            };
            console.log("🎫 NextAuth: Returning user object:", user);
            return user;
          }
          console.log("❌ NextAuth: Authentication failed - no user returned");
          return null;
        } catch (error) {
          console.error("❌ NextAuth: Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/dang-nhap",
    error: "/",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (user) {
        token.role = user.role;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token and user id from a provider
      if (token && session.user) {
        session.user.id = parseInt(token.sub!);
        session.user.role = token.role;
        session.accessToken = token.accessToken;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Placeholder function for user authentication
// Replace this with your actual authentication logic
async function authenticateUser(email: string, password: string) {
  try {
    const response = await login({ email, password });
    // Check for both 200 (OK) and 201 (Created) status codes
    if (response.status === 200 || response.status === 201) {
      console.log("✅ NextAuth authentication successful:", response.data);
      return {
        user: response.data.user,
        access_token: response.data.access_token,
      };
    }
  } catch (error) {
    console.error("❌ NextAuth authentication failed for user:", email, error);
  }

  return null;
}
