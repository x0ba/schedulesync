import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-border/40 bg-background/95 support-[backdrop-filter]:bg-background/60 border-t py-6 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
        <p className="text-muted-foreground text-sm">
          &copy; {new Date().getFullYear()} ScheduleSync. All rights reserved.
        </p>
        <div className="text-muted-foreground flex items-center gap-6 text-sm">
          <Link
            href="/privacy"
            className="hover:text-foreground transition-colors"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
