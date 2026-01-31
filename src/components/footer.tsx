import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-border/50 border-t py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
        <div className="flex flex-col items-center gap-1 md:items-start">
          <span className="font-serif text-lg font-semibold tracking-tight">
            Schedule<span className="text-accent">Sync</span>
          </span>
        </div>
        <div className="text-muted-foreground flex items-center gap-3 text-sm">
          <Link
            href="/privacy"
            className="editorial-link hover:text-foreground transition-colors"
          >
            Privacy
          </Link>
          <span className="text-border">|</span>
          <span>&copy; {new Date().getFullYear()} ScheduleSync</span>
        </div>
      </div>
    </footer>
  );
}
