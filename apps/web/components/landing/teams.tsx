import { cn } from "cn";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  GitBranchIcon,
  SecurityValidationIcon,
} from "@hugeicons/core-free-icons";

import { SectionIntro } from "./section-intro";

const audience = [
  {
    title: "Engineering",
    detail: "Track work, unblock progress, and ship with context.",
    tone: "bg-violet-400",
  },
  {
    title: "Design",
    detail: "Keep ideas, collaboration, and delivery connected.",
    tone: "bg-sky-400",
  },
  {
    title: "Product",
    detail: "Turn priorities into clear, actionable plans.",
    tone: "bg-amber-400",
  },
  {
    title: "Every other team",
    detail: "Adapt the workspace to how your team works.",
    tone: "bg-emerald-400",
  },
] as const;

export function TeamsSection() {
  return (
    <section
      id="teams"
      aria-labelledby="teams-heading"
      className="scroll-mt-24 px-5 py-24 sm:px-8 sm:py-32 lg:px-10"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-end">
          <SectionIntro
            id="teams-heading"
            eyebrow="Built for the way you work"
            title="One workspace. Many ways to move."
            description="Agile or not, every team deserves clarity. Organize work around your people and processes — not the other way around."
          />
          <p className="max-w-md text-sm leading-7 text-zinc-500 lg:justify-self-end">
            Create team spaces, connect work across projects, and share a common
            understanding of what comes next.
          </p>
        </div>
        <div className="mt-14 grid overflow-hidden rounded-xl border border-white/[0.09] sm:grid-cols-2 lg:grid-cols-4">
          {audience.map((team, index) => (
            <article
              key={team.title}
              className={cn(
                "min-h-56 p-7 sm:p-8",
                index > 0 && "border-t border-white/[0.08] sm:border-t-0",
                index % 2 === 1 && "sm:border-l sm:border-white/[0.08]",
                index >= 2 && "lg:border-l lg:border-white/[0.08]",
                index >= 2 && "sm:border-t lg:border-t-0",
              )}
            >
              <span
                aria-hidden="true"
                className={cn("mb-9 block size-3 rounded-[4px]", team.tone)}
              />
              <h3 className="text-lg font-semibold tracking-[-0.03em] text-zinc-100">
                {team.title}
              </h3>
              <p className="mt-2 max-w-[210px] text-sm leading-6 text-zinc-400">
                {team.detail}
              </p>
            </article>
          ))}
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-4 rounded-xl border border-white/[0.075] bg-white/[0.025] p-5 sm:p-6">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/5 text-zinc-300">
              <HugeiconsIcon
                icon={SecurityValidationIcon}
                aria-hidden="true"
                className="size-5"
              />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">
                A space for your workspace
              </h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Bring people together with clearly defined workspace membership
                and roles.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 rounded-xl border border-white/[0.075] bg-white/[0.025] p-5 sm:p-6">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/5 text-zinc-300">
              <HugeiconsIcon
                icon={GitBranchIcon}
                aria-hidden="true"
                className="size-5"
              />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">
                The context stays connected
              </h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Tie projects, teams, work items, and documents into a coherent
                flow.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
