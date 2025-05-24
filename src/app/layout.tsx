import { NextAuthProvider } from "@/providers/session-provider";
import { Toaster } from "sonner";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NextAuthProvider>{children}</NextAuthProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
