import { cn } from "cn";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  ArrowUpRight01Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";

import { LANDING_PATHS } from "@/lib/landing-links";
import { HeroLaser } from "./hero-laser";
import { ProductPreview } from "./product-preview";

/** Marketing hero intentionally keeps headline and CTAs server rendered. */
export function Hero() {
  return (
    <section
      id="overview"
      aria-labelledby="hero-heading"
      className="relative scroll-mt-24 overflow-hidden border-b border-white/[0.075]"
    >
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_65%_35%_at_50%_4%,rgba(73,52,133,.16),transparent)]",
        )}
      />
      <div className="relative mx-auto max-w-7xl px-5 pt-20 pb-20 sm:px-8 sm:pt-28 lg:px-10 lg:pt-32 lg:pb-28">
        <HeroLaser
          intro={
            <div className="relative z-20 mr-auto mb-13 max-w-[940px] text-left sm:mb-16">
              <a
                href="#features"
                className={cn(
                  "group mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3.5 py-1.5 text-xs text-zinc-300 transition-colors hover:border-violet-400/35 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400",
                )}
              >
                <HugeiconsIcon
                  icon={SparklesIcon}
                  aria-hidden="true"
                  className="size-3.5 text-violet-300"
                />
                Meet a more focused way of working
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  aria-hidden="true"
                  className="size-3.5 transition-transform group-hover:translate-x-0.5"
                />
              </a>
              <h1
                id="hero-heading"
                className={cn(
                  "max-w-[920px] text-balance text-[clamp(2.75rem,6.2vw,5.75rem)] leading-[0.99] font-semibold tracking-[-0.073em] text-zinc-50",
                )}
              >
                Your team&apos;s work.
                <span className="block text-zinc-400">In perfect orbit.</span>
              </h1>
              <p className="mt-7 max-w-[540px] text-pretty text-[15px] leading-[1.75] text-zinc-400 sm:text-lg">
                Projects, work items, sprints, and knowledge. One beautiful
                workspace to stay aligned and move what matters forward.
              </p>
              <div className="mt-8 flex flex-col items-start justify-start gap-3 sm:flex-row">
                <Link
                  href={LANDING_PATHS.signup}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-[#121216] transition-colors hover:bg-zinc-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400 sm:w-auto",
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
                  href="#workflow"
                  className={cn(
                    "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-white/[0.14] bg-white/[0.035] px-6 text-sm font-medium text-white transition-colors hover:bg-white/[0.08] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400 sm:w-auto",
                  )}
                >
                  Explore Orbit{" "}
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    aria-hidden="true"
                    className="size-4"
                  />
                </a>
              </div>
            </div>
          }
        >
          <ProductPreview />
        </HeroLaser>
        <p className="relative z-10 mt-6 text-center text-xs text-zinc-600">
          A clearer view of your work, from idea to done.
        </p>
      </div>
    </section>
  );
}
