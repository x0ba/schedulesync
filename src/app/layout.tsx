import "@/styles/globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import { type Metadata } from "next";
import { Inter } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
  title: "ScheduleSync",
  description:
    "A completely free tool to convert your course schedule into a calendar file you can import into your calendar app.",
  icons: [
    { rel: "icon", url: "/favicon/favicon.ico" },
    { rel: "icon", url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    { rel: "icon", url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    { rel: "apple-touch-icon", url: "/favicon/apple-touch-icon.png" },
    { rel: "icon", url: "/favicon/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
    { rel: "icon", url: "/favicon/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
  ],
  manifest: "/favicon/site.webmanifest",
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable}`}>
        <body>
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
