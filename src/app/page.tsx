import { Header } from "@/components/header";
import { UploadZone } from "@/components/upload-zone";
import { FAQ } from "@/components/faq";
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

      <main className="min-h-screen pt-20">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
          {/* Asymmetrical Hero Grid */}
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
            {/* Left Column - Hero Text */}
            <div className="animate-editorial-fade-in lg:col-span-7">
              <span className="section-label mb-6 block">
                Schedule Conversion
              </span>

              <h1 className="text-foreground mb-8 text-4xl leading-[1.1] font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Turn screenshots
                <br />
                into <em className="text-accent not-italic">calendar</em>
                <br />
                events
              </h1>

              <p className="text-muted-foreground mb-10 max-w-md text-lg leading-relaxed">
                Upload a screenshot of your course schedule and we&apos;ll
                generate calendar files you can import anywhere. Private by
                default.
              </p>

              {/* Feature list with separators */}
              <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <span>Any format</span>
                <span className="text-accent">{"/"}</span>
                <span>Google, Apple, Outlook</span>
                <span className="text-accent">{"/"}</span>
                <span>No account required</span>
              </div>
            </div>

            {/* Right Column - Upload Zone */}
            <div className="lg:col-span-5">
              <UploadZone />
            </div>
          </div>
        </div>

        {/* FAQ Section - Full Width */}
        <div className="border-border/50 border-t">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <FAQ />
          </div>
        </div>
      </main>
    </>
  );
}
