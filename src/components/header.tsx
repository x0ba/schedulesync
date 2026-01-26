import Link from "next/link";

import { HeaderAuth } from "@/components/header-auth";

export function Header() {
  return (
    <header className="border-border/50 bg-background/95 fixed top-0 right-0 left-0 z-40 border-b backdrop-blur-sm">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
        <Link href="/">
          <span className="font-serif text-xl font-semibold tracking-tight">
            Schedule<span className="text-accent">Sync</span>
          </span>
        </Link>

        <HeaderAuth />
      </div>
    </header>
  );
}
