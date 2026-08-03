import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import PwaInitializer from "./_components/PwaInitializer";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "musictape — Make a mixtape for someone special",
  description:
    "Create a personalized digital mixtape — choose a theme, add songs, write a note, and share a single link.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-gray-950">
        <PwaInitializer />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
