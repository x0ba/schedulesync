import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-border border-t py-6">
      <div className="mx-auto flex max-w-lg items-center justify-between px-4">
        <span className="text-muted-foreground text-xs">
          &copy; {new Date().getFullYear()} ScheduleSync
        </span>
        <Link
          href="/privacy"
          className="text-muted-foreground hover:text-foreground text-xs transition-colors"
        >
          Privacy
        </Link>
      </div>
    </footer>
  );
}
