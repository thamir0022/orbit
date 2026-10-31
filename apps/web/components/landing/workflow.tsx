import { cn } from "cn";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDownRight01Icon,
  ArrowUpRight01Icon,
  BubbleChatIcon,
  CheckmarkCircle02Icon,
  Progress01Icon,
} from "@hugeicons/core-free-icons";

import { SectionIntro } from "./section-intro";

const steps = [
  {
    number: "01",
    title: "Capture the idea",
    detail: "Bring new work and context into one shared place.",
  },
  {
    number: "02",
    title: "Make a clear plan",
    detail: "Set priorities, assign ownership, and find a rhythm.",
  },
  {
    number: "03",
    title: "Keep the momentum",
    detail: "Track progress, share updates, and close the loop.",
  },
] as const;

export function WorkflowSection() {
  return (
    <section
      id="workflow"
      aria-labelledby="workflow-heading"
      className="scroll-mt-24 border-y border-white/[0.075] bg-[#0d0d11] px-5 py-24 sm:px-8 sm:py-32 lg:px-10"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div>
          <SectionIntro
            id="workflow-heading"
            eyebrow="A better flow"
            title="Less busywork. More meaningful progress."
            description="From the first idea to the final handoff, Orbit brings structure to the work without getting in the way."
          />
          <ol className="mt-11 space-y-0">
            {steps.map((step, index) => (
              <li
                key={step.number}
                className="relative flex gap-5 pb-8 last:pb-0"
              >
                {index < steps.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute top-8 bottom-0 left-[17px] w-px bg-white/10"
                  />
                )}
                <span
                  className={cn(
                    "relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-[#18181e] text-[11px] font-medium text-zinc-300",
                  )}
                >
                  {step.number}
                </span>
                <div className="pt-0.5">
                  <h3 className="text-sm font-semibold text-white">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-zinc-400">
                    {step.detail}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div
          aria-label="Illustrative Orbit work item with its activity and progress"
          role="img"
          className={cn(
            "overflow-hidden rounded-xl border border-white/10 bg-[#17171d] shadow-[0_30px_80px_-40px_rgba(0,0,0,0.7)]",
          )}
        >
          <div
            className={cn(
              "flex h-12 items-center justify-between gap-3 border-b border-white/[0.075] px-5 text-xs text-zinc-400",
            )}
          >
            <span>
              Engineering <span className="mx-2 text-zinc-600">/</span> ORB-104
            </span>
            <HugeiconsIcon
              icon={ArrowUpRight01Icon}
              aria-hidden="true"
              className="size-3.5"
            />
          </div>
          <div className="p-6 sm:p-8">
            <div
              className={cn(
                "inline-flex items-center gap-2 rounded-full border border-violet-400/15 bg-violet-400/10 px-2.5 py-1 text-[11px] font-medium text-violet-300",
              )}
            >
              <HugeiconsIcon icon={Progress01Icon} className="size-3" /> In
              progress
            </div>
            <h3 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-white">
              Refine workspace onboarding
            </h3>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Help new teams get from their first workspace to their first
              meaningful project, faster.
            </p>
            <div className="my-7 grid grid-cols-2 gap-4 border-y border-white/[0.075] py-5 text-[11px] sm:grid-cols-3">
              <div>
                <p className="text-zinc-500">Priority</p>
                <p className="mt-2 flex items-center gap-2 text-zinc-200">
                  <span className="h-3 w-1.5 rounded-sm bg-amber-400" /> High
                </p>
              </div>
              <div>
                <p className="text-zinc-500">Assignee</p>
                <p className="mt-2 flex items-center gap-2 text-zinc-200">
                  <span className="flex size-5 items-center justify-center rounded-full bg-violet-500/30 text-[9px]">
                    SK
                  </span>{" "}
                  Sam K.
                </p>
              </div>
              <div>
                <p className="text-zinc-500">Project</p>
                <p className="mt-2 flex items-center gap-2 text-zinc-200">
                  <span className="size-2 rounded-sm bg-sky-400" /> Orbit
                  Platform
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
              <HugeiconsIcon
                icon={BubbleChatIcon}
                aria-hidden="true"
                className="size-4 text-zinc-500"
              />{" "}
              Activity
            </div>
            <div
              className={cn(
                "relative mt-5 space-y-5 pl-4 before:absolute before:top-1 before:bottom-2 before:left-[5px] before:w-px before:bg-white/10",
              )}
            >
              <div
                className={cn(
                  "relative text-[11px] before:absolute before:top-1 before:-left-[15px] before:size-2 before:rounded-full before:bg-violet-400",
                )}
              >
                <p className="text-zinc-300">
                  <span className="font-semibold text-white">Sam K.</span> moved
                  this to In progress
                </p>
                <p className="mt-1 text-zinc-500">Today</p>
              </div>
              <div
                className={cn(
                  "relative text-[11px] before:absolute before:top-1 before:-left-[15px] before:size-2 before:rounded-full before:bg-zinc-600",
                )}
              >
                <p className="text-zinc-300">
                  <span className="font-semibold text-white">Alex D.</span>{" "}
                  added a comment
                </p>
                <p className="mt-1 leading-5 text-zinc-500">
                  Looks good — ready for the next iteration.
                </p>
              </div>
              <div
                className={cn(
                  "relative flex items-center gap-2 text-[11px] text-zinc-400 before:absolute before:top-1 before:-left-[15px] before:size-2 before:rounded-full before:bg-emerald-400",
                )}
              >
                <HugeiconsIcon
                  icon={CheckmarkCircle02Icon}
                  aria-hidden="true"
                  className="size-3.5 text-emerald-400"
                />{" "}
                Ready to move forward{" "}
                <HugeiconsIcon
                  icon={ArrowDownRight01Icon}
                  aria-hidden="true"
                  className="ml-auto size-3.5"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
