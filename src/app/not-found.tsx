import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="via-background to-background min-h-screen bg-linear-to-b from-orange-50/40 pt-24 pb-16">
        {/* Decorative background elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 right-1/4 size-96 rounded-full bg-linear-to-br from-amber-200/30 to-orange-200/20 blur-3xl" />
          <div className="absolute top-1/3 -left-32 size-80 rounded-full bg-linear-to-br from-orange-100/40 to-amber-100/30 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-2xl px-6 py-20">
          <div className="text-center">
            <h1 className="text-foreground mb-4 text-6xl font-bold tracking-tight sm:text-7xl">
              404
            </h1>
            <h2 className="text-foreground mb-4 text-2xl font-semibold tracking-tight sm:text-3xl">
              Page Not Found
            </h2>
            <p className="text-muted-foreground mx-auto mb-8 max-w-md text-lg">
              Oops! The page you&apos;re looking for doesn&apos;t exist. It
              might have been moved or deleted.
            </p>
            <Link href="/">
              <Button size="lg" className="gap-2">
                <Home className="size-4" />
                Go Back Home
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
