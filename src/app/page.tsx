import { Header } from "@/components/header";
import { UploadZone } from "@/components/upload-zone";
import { FAQ } from "@/components/faq";

export default function Home() {
  return (
    <>
      <Header />

      <main className="via-background to-background min-h-screen bg-linear-to-b from-orange-50/40 pt-16">
        {/* Decorative background elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 right-1/4 size-96 rounded-full bg-linear-to-br from-amber-200/30 to-orange-200/20 blur-3xl" />
          <div className="absolute top-1/3 -left-32 size-80 rounded-full bg-linear-to-br from-orange-100/40 to-amber-100/30 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-2xl px-6 py-20">
          {/* Hero section */}
          <div className="mb-12 text-center">
            <h1 className="text-foreground text-4xl font-bold tracking-tight sm:text-5xl">
              Turn screenshots into
              <span className="relative mx-2 whitespace-nowrap">
                <span className="relative bg-linear-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
                  calendar events
                </span>
              </span>
            </h1>
            <p className="text-muted-foreground mx-auto mt-4 max-w-md text-lg">
              Upload a screenshot of your course schedule and we&apos;ll
              generate calendar files you can import anywhere.
            </p>
          </div>

          {/* Upload area */}
          <UploadZone />

          {/* Feature hints */}
          <div className="text-muted-foreground mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-green-500" />
              Works with any schedule format
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-green-500" />
              Export to Google, Apple, Outlook
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-green-500" />
              No account required
            </div>
          </div>

          {/* FAQ Section */}
          <FAQ />
        </div>
      </main>
    </>
  );
}
