import { cn } from "cn";
import Link from "next/link";

import { footerGroups } from "@/lib/landing-links";
import OrbitLogo from "./orbit-logo";

async function getCopyrightYear() {
  "use cache";
  return new Date().getFullYear();
}

/** Small, accessible footer; links target real sections and configurable auth routes. */
export async function Footer() {
  const year = await getCopyrightYear();

  return (
    <footer className="border-t border-white/[0.075] bg-[#09090b] px-5 pt-16 pb-8 text-sm sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-[1.4fr_2fr] lg:gap-24">
          <div>
            <OrbitLogo className="invert" size="medium"/>
            <p className="mt-5 max-w-[240px] text-sm leading-6 text-zinc-500">
              A calmer, clearer place for your team&apos;s work.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-9 sm:grid-cols-3">
            {footerGroups.map((group) => (
              <nav key={group.heading} aria-label={`${group.heading} links`}>
                <h2 className="mb-5 text-xs font-semibold text-zinc-200">
                  {group.heading}
                </h2>
                <ul className="space-y-3.5">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        target={
                          link.href.startsWith("http") ? "_blank" : undefined
                        }
                        rel={
                          link.href.startsWith("http")
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className={cn(
                          "rounded-sm text-[13px] text-zinc-500 transition-colors hover:text-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400",
                        )}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
        <div
          className={cn(
            "mt-20 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.075] pt-6 text-xs text-zinc-600",
          )}
        >
          <span>© {year} Orbit. Built for the work ahead.</span>
          <span>Thoughtfully made for teams.</span>
        </div>
      </div>
    </footer>
  );
}
