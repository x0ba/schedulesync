import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Header() {
  return (
    <header className="border-border/40 bg-background/80 fixed top-0 right-0 left-0 z-50 border-b backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link href="/">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-md shadow-orange-500/20">
              <Calendar className="size-5 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Schedule<span className="text-orange-500">Sync</span>
            </span>
          </div>
        </Link>

        <SignedOut>
          <SignInButton mode="modal">
            <Button variant="outline" size="sm">
              Sign in
            </Button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  );
}
