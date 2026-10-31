import { cn } from "cn";
import type { ReactNode } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  BubbleChatIcon,
  CheckmarkCircle02Icon,
  File01Icon,
  Layers01Icon,
  Notification03Icon,
  Task01Icon,
  Tick02Icon,
  UserMultipleIcon,
  WorkflowSquare01Icon,
} from "@hugeicons/core-free-icons";

import { SectionIntro } from "./section-intro";

const projectRows = [
  {
    label: "Website redesign",
    state: "In progress",
    color: "bg-violet-400",
    width: "w-[72%]",
  },
  {
    label: "Mobile experience",
    state: "In review",
    color: "bg-sky-400",
    width: "w-[54%]",
  },
  {
    label: "Platform reliability",
    state: "Planned",
    color: "bg-zinc-500",
    width: "w-[27%]",
  },
] as const;

function FeatureCard({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <article
      id={id}
      className={cn(
        "group relative min-w-0 overflow-hidden rounded-2xl border border-white/[0.09] bg-[#111115]",
        className,
      )}
    >
      {children}
    </article>
  );
}

export function Features() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="scroll-mt-24 px-5 py-24 sm:px-8 sm:py-32 lg:px-10"
    >
      <div className="mx-auto max-w-7xl">
        <SectionIntro
          id="features-heading"
          eyebrow="Everything in its place"
          title="All the moving parts. One clear picture."
          description="Bring plans, people, conversations, and progress together — without the clutter of disconnected tools."
        />
        <div className="mt-14 grid gap-4 lg:grid-cols-12">
          <FeatureCard id="projects" className="lg:col-span-7">
            <div className="p-7 pb-0 sm:p-9 sm:pb-0">
              <span
                className={cn(
                  "mb-5 flex size-9 items-center justify-center rounded-lg border border-violet-400/20 bg-violet-400/10 text-violet-300",
                )}
              >
                <HugeiconsIcon
                  icon={Layers01Icon}
                  aria-hidden="true"
                  className="size-[18px]"
                />
              </span>
              <h3 className="text-2xl font-semibold tracking-[-0.04em] text-white">
                Projects, without the guesswork.
              </h3>
              <p className="mt-3 max-w-md text-sm leading-6 text-zinc-400">
                Bring goals, ownership, priorities, and progress into a shared
                view everyone can understand.
              </p>
            </div>
            <div
              aria-hidden="true"
              className={cn(
                "mt-9 translate-x-7 rounded-tl-xl border-t border-l border-white/10 bg-[#19191f] p-5 sm:ml-16 sm:translate-x-5 sm:p-7",
              )}
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-200">
                  Projects <span className="ml-1 text-zinc-500">3</span>
                </span>
                <span className="text-[11px] text-zinc-500">
                  All projects{" "}
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    className="ml-1 inline size-3"
                  />
                </span>
              </div>
              <div className="space-y-5">
                {projectRows.map((row) => (
                  <div key={row.label}>
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-1 text-[11px]">
                      <span className="font-medium text-zinc-200">
                        {row.label}
                      </span>
                      <span className="text-zinc-500">{row.state}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.075]">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          row.color,
                          row.width,
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FeatureCard>

          <FeatureCard id="sprints" className="lg:col-span-5">
            <div className="p-7 pb-0 sm:p-9 sm:pb-0">
              <span
                className={cn(
                  "mb-5 flex size-9 items-center justify-center rounded-lg border border-sky-400/20 bg-sky-400/10 text-sky-300",
                )}
              >
                <HugeiconsIcon
                  icon={WorkflowSquare01Icon}
                  aria-hidden="true"
                  className="size-[18px]"
                />
              </span>
              <h3 className="text-2xl font-semibold tracking-[-0.04em] text-white">
                Stay in a rhythm.
              </h3>
              <p className="mt-3 max-w-sm text-sm leading-6 text-zinc-400">
                Plan focused sprints, see what is in flight, and move forward
                with confidence.
              </p>
            </div>
            <div
              aria-hidden="true"
              className="mx-7 mt-10 mb-8 rounded-xl border border-white/10 bg-[#1b1b22] p-5 sm:mx-9"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">
                  Sprint 08
                </span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-medium text-emerald-300">
                  Active
                </span>
              </div>
              <p className="mt-2 text-[11px] text-zinc-500">
                Build the next chapter
              </p>
              <div className="mt-7 flex items-end justify-between">
                <span className="text-4xl font-semibold tracking-[-0.07em] text-white">
                  72<span className="text-xl text-zinc-500">%</span>
                </span>
                <span className="mb-1 text-[11px] text-zinc-400">
                  18 / 25 points
                </span>
              </div>
              <div className="mt-3 flex h-2 gap-1 overflow-hidden rounded-full bg-white/5">
                <span className="w-[72%] rounded-full bg-violet-400" />
                <span className="flex-1 bg-white/5" />
              </div>
              <div className="mt-4 flex items-center justify-between text-[11px] text-zinc-500">
                <span>Progress</span>
                <span>On track</span>
              </div>
            </div>
          </FeatureCard>

          <FeatureCard className="lg:col-span-4" id="documents">
            <div className="p-7 pb-0 sm:p-8 sm:pb-0">
              <span
                className={cn(
                  "mb-5 flex size-9 items-center justify-center rounded-lg border border-amber-400/20 bg-amber-400/10 text-amber-300",
                )}
              >
                <HugeiconsIcon
                  icon={File01Icon}
                  aria-hidden="true"
                  className="size-[18px]"
                />
              </span>
              <h3 className="text-xl font-semibold tracking-[-0.04em] text-white">
                Knowledge that stays.
              </h3>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Capture plans, context, and decisions right alongside the work.
              </p>
            </div>
            <div
              aria-hidden="true"
              className="mx-7 mt-8 mb-8 min-h-[148px] rounded-lg border border-white/10 bg-[#1c1c22] p-5 sm:mx-8"
            >
              <div className="flex items-center gap-2 text-xs font-medium text-white">
                <HugeiconsIcon
                  icon={File01Icon}
                  className="size-3.5 text-amber-300"
                />{" "}
                Product brief
              </div>
              <div className="mt-5 h-2 w-[85%] rounded bg-white/15" />
              <div className="mt-2 h-2 w-full rounded bg-white/10" />
              <div className="mt-2 h-2 w-[64%] rounded bg-white/10" />
              <div className="mt-4 h-2 w-[73%] rounded bg-white/5" />
            </div>
          </FeatureCard>

          <FeatureCard className="lg:col-span-4">
            <div className="p-7 pb-0 sm:p-8 sm:pb-0">
              <span
                className={cn(
                  "mb-5 flex size-9 items-center justify-center rounded-lg border border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
                )}
              >
                <HugeiconsIcon
                  icon={UserMultipleIcon}
                  aria-hidden="true"
                  className="size-[18px]"
                />
              </span>
              <h3 className="text-xl font-semibold tracking-[-0.04em] text-white">
                Teams in sync.
              </h3>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Give every team its own space while keeping everyone connected.
              </p>
            </div>
            <div
              aria-hidden="true"
              className="mx-7 mt-8 mb-8 min-h-[148px] space-y-2 sm:mx-8"
            >
              <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.035] px-4 py-3">
                <span className="size-3 rounded bg-violet-400" />
                <span className="flex-1 text-xs text-zinc-200">
                  Engineering
                </span>
                <span className="text-[11px] text-zinc-500">12 members</span>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.035] px-4 py-3">
                <span className="size-3 rounded bg-sky-400" />
                <span className="flex-1 text-xs text-zinc-200">Design</span>
                <span className="text-[11px] text-zinc-500">6 members</span>
              </div>
            </div>
          </FeatureCard>

          <FeatureCard className="lg:col-span-4">
            <div className="p-7 pb-0 sm:p-8 sm:pb-0">
              <span
                className={cn(
                  "mb-5 flex size-9 items-center justify-center rounded-lg border border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-300",
                )}
              >
                <HugeiconsIcon
                  icon={Notification03Icon}
                  aria-hidden="true"
                  className="size-[18px]"
                />
              </span>
              <h3 className="text-xl font-semibold tracking-[-0.04em] text-white">
                Nothing gets lost.
              </h3>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Thoughtful notifications and discussions keep context close.
              </p>
            </div>
            <div
              aria-hidden="true"
              className="mx-7 mt-8 mb-8 min-h-[148px] space-y-2 sm:mx-8"
            >
              <div className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.035] px-3 py-3">
                <span className="mt-0.5 flex size-6 items-center justify-center rounded-full bg-violet-400/20 text-violet-300">
                  <HugeiconsIcon icon={BubbleChatIcon} className="size-3" />
                </span>
                <div className="min-w-0 text-[11px]">
                  <div className="text-zinc-200">New comment on ORB-104</div>
                  <div className="mt-1 text-zinc-500">
                    Keep the conversation moving
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 px-3 py-1 text-[11px] text-zinc-400">
                <HugeiconsIcon
                  icon={CheckmarkCircle02Icon}
                  className="size-4 text-emerald-400"
                />{" "}
                Work item completed{" "}
                <HugeiconsIcon
                  icon={Tick02Icon}
                  className="ml-auto size-3.5 text-emerald-400"
                />
              </div>
            </div>
          </FeatureCard>
        </div>
        <p className="mt-5 flex items-center gap-2 text-xs text-zinc-500">
          <HugeiconsIcon
            icon={Task01Icon}
            aria-hidden="true"
            className="size-3.5"
          />{" "}
          Thoughtfully connected, intentionally simple.
        </p>
      </div>
    </section>
  );
}
