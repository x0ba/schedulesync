import Link from "next/link";

import { HeaderAuth } from "@/components/header-auth";

export function Header() {
  return (
    <header className="border-border fixed top-0 right-0 left-0 z-40 border-b bg-white">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          ScheduleSync
        </Link>

        <HeaderAuth />
      </div>
    </header>
  );
}
