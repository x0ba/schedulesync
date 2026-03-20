import { Header } from "@/components/header";
import { UploadZone } from "@/components/upload-zone";
import { type Metadata } from "next";

function getBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.NEXT_PUBLIC_URL) return process.env.NEXT_PUBLIC_URL;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

const baseUrl = getBaseUrl();

export const metadata: Metadata = {
  title: "ScheduleSync - Convert Course Schedules to Calendar Files",
  description:
    "Free tool to convert course schedule screenshots into calendar files. Export to Google Calendar, Apple Calendar, or Outlook. No account required.",
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
  alternates: {
    canonical: baseUrl,
  },
  openGraph: {
    title: "ScheduleSync - Convert Course Schedules to Calendar Files",
    description:
      "Free tool to convert course schedule screenshots into calendar files. Export to Google Calendar, Apple Calendar, or Outlook. No account required.",
    url: baseUrl,
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
    title: "ScheduleSync - Convert Course Schedules to Calendar Files",
    description:
      "Free tool to convert course schedule screenshots into calendar files. Export to Google Calendar, Apple Calendar, or Outlook. No account required.",
    images: ["/og-image.png"],
  },
};

export default function Home() {
  return (
    <>
      <Header />

      <main className="min-h-screen pt-16">
        <div className="mx-auto w-full max-w-lg px-4 py-12 sm:py-16">
          <div className="mb-8 text-center">
            <h1 className="text-foreground text-2xl font-semibold tracking-tight">
              Convert your schedule to a calendar file
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Upload a screenshot of your course schedule. We&apos;ll extract
              the events so you can export them to Google Calendar, Apple
              Calendar, or Outlook.
            </p>
          </div>

          <UploadZone />
        </div>
      </main>
    </>
  );
}
