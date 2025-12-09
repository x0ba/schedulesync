import { Header } from "@/components/header";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | ScheduleSync",
  description: "Privacy Policy for ScheduleSync",
};

export default function PrivacyPolicy() {
  const lastUpdated = "December 9, 2025";

  return (
    <>
      <Header />
      <main className="bg-background min-h-screen pt-24 pb-16">
        <div className="mx-auto max-w-3xl px-6">
          <h1 className="mb-2 text-4xl font-bold tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground mb-12">
            Last Updated: {lastUpdated}
          </p>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="mb-4 text-2xl font-semibold tracking-tight">
                1. Introduction
              </h2>
              <p className="leading-7">
                ScheduleSync (&quot;we&quot;, &quot;our&quot;, or
                &quot;us&quot;) is committed to protecting your privacy. This
                Privacy Policy explains how we collect, use, and safeguard your
                information when you use our website and services.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold tracking-tight">
                2. Information We Collect
              </h2>
              <p className="mb-4 leading-7">
                We collect information that you provide directly to us when
                using our services:
              </p>
              <ul className="mb-4 list-disc space-y-2 pl-6">
                <li>
                  <strong>Uploaded Images:</strong> When you upload schedule
                  screenshots, they are processed transiently to extract
                  schedule information. We do not permanently store these
                  images.
                </li>
                <li>
                  <strong>Account Information:</strong> If you sign in, we
                  collect basic authentication information via Clerk (email
                  address, name, profile picture).
                </li>
                <li>
                  <strong>Google User Data:</strong> If you choose to sync with
                  Google Calendar, we access your Google Calendar to create
                  calendars and add events.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold tracking-tight">
                3. How We Use Your Information
              </h2>
              <p className="mb-4 leading-7">
                We use the information we collect for the following purposes:
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li>
                  To parse schedule information from your uploaded images.
                </li>
                <li>To generate downloadable iCal files.</li>
                <li>
                  To sync events to your Google Calendar (only with your
                  explicit permission).
                </li>
                <li>To improve our services and fix technical issues.</li>
              </ul>
              <p className="mt-4 leading-7">
                <strong>Important:</strong> We do not sell your personal data to
                third parties.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold tracking-tight">
                4. Google API Services User Data Policy
              </h2>
              <p className="leading-7">
                ScheduleSync&apos;s use and transfer to any other app of
                information received from Google APIs will adhere to the{" "}
                <a
                  href="https://developers.google.com/terms/api-services-user-data-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-600 hover:underline"
                >
                  Google API Services User Data Policy
                </a>
                , including the Limited Use requirements.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold tracking-tight">
                5. Third-Party Services
              </h2>
              <p className="mb-4 leading-7">
                We use trusted third-party services to operate our application:
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li>
                  <strong>Clerk:</strong> For secure user authentication and
                  account management.
                </li>
                <li>
                  <strong>Google Gemini:</strong> For AI-powered image analysis
                  of schedule screenshots.
                </li>
                <li>
                  <strong>PostHog:</strong> For anonymized analytics to help us
                  understand how our app is used.
                </li>
                <li>
                  <strong>Sentry:</strong> For error tracking and monitoring to
                  ensure service reliability.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold tracking-tight">
                6. Data Security
              </h2>
              <p className="leading-7">
                We implement appropriate technical and organizational measures
                to protect your personal information. However, no method of
                transmission over the Internet or electronic storage is 100%
                secure, so we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold tracking-tight">
                7. Contact Us
              </h2>
              <p className="leading-7">
                If you have any questions about this Privacy Policy, please
                contact the dev at danielxu0307@gmail.com.
              </p>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
