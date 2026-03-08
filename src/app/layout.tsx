"use client";

import { Toaster } from "sonner";
import { AuthProvider } from "@/components/auth/AuthProvider";
import "./globals.css";
import {HeroUIProvider} from "@heroui/react";
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <HeroUIProvider>
          <AuthProvider>  
            <main className="light">{children}</main>
            <Toaster position="bottom-right" richColors />
          </AuthProvider>
        </HeroUIProvider>
      </body>
    </html>
  );
}
