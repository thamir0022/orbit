"use client";

import { cn } from "cn";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon, Menu01Icon } from "@hugeicons/core-free-icons";
import { useState } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { LANDING_PATHS, navigation } from "@/lib/landing-links";
import OrbitLogo from "./orbit-logo";

/** Responsive navigation with real links and an accessible mobile dialog. */
export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-white/[0.075] bg-[#09090b]/85 backdrop-blur-xl supports-[backdrop-filter]:bg-[#09090b]/75",
      )}
    >
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-6 px-5 sm:px-8 lg:px-10">
        <OrbitLogo className="invert" size="small" />

        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-1 md:flex"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-[13px] font-medium text-zinc-400 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <Link
            href={LANDING_PATHS.login}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "rounded-md text-[13px] font-medium text-zinc-400 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400",
            )}
          >
            Log in
          </Link>
          <Link
            href={LANDING_PATHS.signup}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex h-9 items-center justify-center gap-2 rounded-full bg-white px-4 text-[13px] font-semibold text-zinc-950 transition-colors hover:bg-zinc-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400",
            )}
          >
            Get started
            <HugeiconsIcon
              icon={ArrowUpRight01Icon}
              aria-hidden="true"
              className="size-3.5"
            />
          </Link>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            aria-label="Open navigation menu"
            className={cn(
              "inline-flex size-10 items-center justify-center rounded-md border border-white/10 text-zinc-200 outline-none transition-colors hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-violet-400 md:hidden",
            )}
          >
            <HugeiconsIcon
              icon={Menu01Icon}
              aria-hidden="true"
              className="size-5"
            />
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-[min(88vw,360px)] border-white/10 bg-[#101014] p-6 text-white"
          >
            <SheetHeader className="px-0 pt-0 text-left">
              <SheetTitle className="text-white">Navigate Orbit</SheetTitle>
              <SheetDescription className="text-zinc-400">
                Explore the workspace for modern teams.
              </SheetDescription>
            </SheetHeader>
            <nav
              aria-label="Mobile navigation"
              className="mt-6 flex flex-col gap-1"
            >
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-md px-3 py-3 text-sm text-zinc-200 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-violet-400",
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <div className="my-3 h-px bg-white/10" aria-hidden="true" />
              <Link
                href={LANDING_PATHS.login}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-md px-3 py-3 text-sm text-zinc-200 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-violet-400",
                )}
              >
                Log in
              </Link>
              <Link
                href={LANDING_PATHS.signup}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className={cn(
                  "mt-3 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400",
                )}
              >
                Get started{" "}
                <HugeiconsIcon
                  icon={ArrowUpRight01Icon}
                  aria-hidden="true"
                  className="size-4"
                />
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
