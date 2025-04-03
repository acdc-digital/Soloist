// lAYOUT
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/layout.tsx

import { ConvexClientProvider } from "@/provider/ConvexClientProvider";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
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
            <main className="min-h-screen">{children}</main>
          </ConvexClientProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}