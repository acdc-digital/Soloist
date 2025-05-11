// WEBSITE LAYOUT
// /Users/matthewsimon/Documents/Github/electron-nextjs/webiste/src/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Soloist - Mood Tracking App",
  description: "Track your mood and get AI-powered insights with Soloist",
  // Add CSP to metadata for better browser compatibility
  other: {
    "Content-Security-Policy": `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com;
      frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com;
      img-src 'self' data: https://*.stripe.com;
      connect-src 'self' https://api.stripe.com;
      style-src 'self' 'unsafe-inline' https://checkout.stripe.com;
      frame-ancestors 'self' http://localhost:* https://localhost:*;
    `.replace(/\s+/g, ' ').trim()
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}