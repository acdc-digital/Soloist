// lAYOUT
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/layout.tsx

import { ConvexClientProvider } from "@/provider/ConvexClientProvider";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
<<<<<<< HEAD
=======
import { UserProvider } from "@/provider/userContext";
>>>>>>> 56bd30b (Updated Authentication Flow)
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Define the font
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Electrode",
  description: "A next-generation development platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body className={`font-sans ${inter.variable}`}>
          <ConvexClientProvider>
<<<<<<< HEAD
            <main className="min-h-screen">{children}</main>
=======
            {/* Wrap children in our UserProvider to provide user context */}
            <UserProvider>
              <main className="min-h-screen">{children}</main>
            </UserProvider>
>>>>>>> 56bd30b (Updated Authentication Flow)
          </ConvexClientProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}