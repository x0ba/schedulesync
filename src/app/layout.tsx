import "@/styles/globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import { type Metadata } from "next";
import { Inter } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { PostHogProvider } from "./providers";
import { Footer } from "@/components/footer";

function getBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.NEXT_PUBLIC_URL) return process.env.NEXT_PUBLIC_URL;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

const baseUrl = getBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "ScheduleSync",
    template: "%s | ScheduleSync",
  },
  description:
    "A completely free tool to convert your course schedule into a calendar file you can import into your calendar app.",
  keywords: [
    "course schedule to calendar",
    "class schedule converter",
    "student calendar tool",
    "schedule screenshot to ical",
    "course schedule generator",
    "academic calendar converter",
    "class schedule to google calendar",
    "schedule to calendar file",
    "free schedule converter",
    "student schedule tool",
  ],
  authors: [{ name: "ScheduleSync" }],
  creator: "ScheduleSync",
  publisher: "ScheduleSync",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "ScheduleSync",
    title: "ScheduleSync",
    description:
      "A completely free tool to convert your course schedule into a calendar file you can import into your calendar app.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ScheduleSync - Convert course schedules to calendar files",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ScheduleSync",
    description:
      "A completely free tool to convert your course schedule into a calendar file you can import into your calendar app.",
    images: ["/og-image.png"],
  },
  icons: [
    { rel: "icon", url: "/favicon/favicon.ico" },
    {
      rel: "icon",
      url: "/favicon/favicon-16x16.png",
      sizes: "16x16",
      type: "image/png",
    },
    {
      rel: "icon",
      url: "/favicon/favicon-32x32.png",
      sizes: "32x32",
      type: "image/png",
    },
    { rel: "apple-touch-icon", url: "/favicon/apple-touch-icon.png" },
    {
      rel: "icon",
      url: "/favicon/android-chrome-192x192.png",
      sizes: "192x192",
      type: "image/png",
    },
    {
      rel: "icon",
      url: "/favicon/android-chrome-512x512.png",
      sizes: "512x512",
      type: "image/png",
    },
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
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ScheduleSync",
    description:
      "A completely free tool to convert your course schedule into a calendar file you can import into your calendar app.",
    url: baseUrl,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Convert schedule screenshots to calendar files",
      "Export to Google Calendar, Apple Calendar, Outlook",
      "No account required",
      "Free to use",
    ],
  };

  return (
    <ClerkProvider>
      <PostHogProvider>
        <html lang="en" className={`${inter.variable}`}>
          <body>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <TRPCReactProvider>{children}</TRPCReactProvider>
            <Footer />
          </body>
        </html>
      </PostHogProvider>
    </ClerkProvider>
  );
}
