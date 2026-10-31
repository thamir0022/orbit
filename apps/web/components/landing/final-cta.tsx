import { cn } from "cn";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  ArrowUpRight01Icon,
} from "@hugeicons/core-free-icons";

import { LANDING_PATHS } from "@/lib/landing-links";

export function FinalCta() {
  return (
    <section
      aria-labelledby="cta-heading"
      className="border-t border-white/[0.075] bg-[#0e0e13] px-5 py-28 sm:px-8 sm:py-36 lg:px-10"
    >
      <div
        className={cn(
          "relative mx-auto max-w-7xl overflow-hidden rounded-[24px] border border-violet-400/[0.12] bg-[#15141e] px-6 py-20 text-center sm:px-12 sm:py-24",
        )}
      >
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_90%_at_50%_110%,rgba(110,95,239,.23),transparent)]",
          )}
        />
        <div className="relative">
          <span className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.14em] text-violet-300 uppercase">
            <span className="size-1.5 rounded-full bg-violet-300" /> Your next
            chapter starts here
          </span>
          <h2
            id="cta-heading"
            className={cn(
              "mx-auto mt-6 max-w-3xl text-balance text-[clamp(2.8rem,6vw,5.6rem)] leading-[1.03] font-semibold tracking-[-0.065em] text-white",
            )}
          >
            Make room for your best work.
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-pretty text-base leading-7 text-zinc-400">
            Bring your team, your projects, and your ideas into Orbit. Keep
            moving, together.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={LANDING_PATHS.signup}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-zinc-950 transition-colors hover:bg-zinc-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400 sm:w-auto",
              )}
            >
              Get started{" "}
              <HugeiconsIcon
                icon={ArrowUpRight01Icon}
                aria-hidden="true"
                className="size-4"
              />
            </Link>
            <a
              href="#overview"
              className={cn(
                "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-white/15 px-6 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400 sm:w-auto",
              )}
            >
              Back to overview{" "}
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                aria-hidden="true"
                className="size-4"
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
