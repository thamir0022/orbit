import { cn } from "cn";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Activity01Icon,
  ArrowUpRight01Icon,
  File01Icon,
  LayoutGridIcon,
  MoreHorizontalIcon,
  Notification03Icon,
  Progress01Icon,
  Search01Icon,
  Settings01Icon,
  Task01Icon,
  Tick02Icon,
  UserMultipleIcon,
} from "@hugeicons/core-free-icons";

const tasks = [
  {
    key: "ORB-104",
    title: "Refine workspace onboarding",
    status: "In progress",
    mark: "bg-amber-400",
    tag: "Experience",
  },
  {
    key: "ORB-105",
    title: "Build the project overview",
    status: "In review",
    mark: "bg-violet-400",
    tag: "Product",
  },
  {
    key: "ORB-106",
    title: "Improve notification preferences",
    status: "Todo",
    mark: "bg-zinc-500",
    tag: "Platform",
  },
  {
    key: "ORB-107",
    title: "Publish release notes",
    status: "Done",
    mark: "bg-emerald-400",
    tag: "Docs",
  },
] as const;

/** Illustrative UI composed from HTML, not a claim about live customer data. */
export function ProductPreview() {
  return (
    <div
      role="img"
      aria-label="Illustration of Orbit: sidebar navigation, project progress and four team work items with statuses"
      className={cn(
        "relative mr-auto w-full max-w-6xl overflow-hidden rounded-[14px] border border-white/[0.14] bg-[#121217] text-left shadow-[0_30px_130px_-28px_rgba(0,0,0,0.9)]",
      )}
    >
      <div className="flex h-10 items-center gap-2 border-b border-white/[0.075] bg-[#17171b] px-4">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-white/15" />
        </div>
        <div className="ml-auto flex items-center gap-2 text-[10px] text-zinc-600">
          <span className="hidden sm:inline">Orbit Workspace</span>
          <span className="rounded bg-white/5 px-2 py-0.5">Preview</span>
        </div>
      </div>
      <div className="flex min-h-[300px] sm:min-h-[405px]">
        <aside
          aria-hidden="true"
          className={cn(
            "hidden w-[190px] shrink-0 flex-col border-r border-white/[0.075] bg-[#111115] px-3 py-4 text-[11px] text-zinc-400 sm:flex lg:w-[222px]",
          )}
        >
          <div className="flex items-center gap-2 rounded-md px-2.5 pb-5 text-zinc-100">
            <span
              className={cn(
                "flex size-6 items-center justify-center rounded bg-violet-500/20 text-xs font-semibold text-violet-300",
              )}
            >
              O
            </span>
            <span className="font-semibold">Orbit Studio</span>
            <HugeiconsIcon
              icon={MoreHorizontalIcon}
              className="ml-auto size-3.5 text-zinc-500"
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 rounded-md px-2.5 py-2">
              <HugeiconsIcon icon={Search01Icon} className="size-3.5" /> Search
            </div>
            <div className="flex items-center gap-2 rounded-md px-2.5 py-2">
              <HugeiconsIcon icon={Notification03Icon} className="size-3.5" />{" "}
              Inbox{" "}
              <span className="ml-auto rounded bg-white/10 px-1.5">3</span>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-white/[0.075] px-2.5 py-2 text-zinc-100">
              <HugeiconsIcon icon={LayoutGridIcon} className="size-3.5" />{" "}
              Projects
            </div>
            <div className="flex items-center gap-2 rounded-md px-2.5 py-2">
              <HugeiconsIcon icon={Task01Icon} className="size-3.5" /> My work
            </div>
            <div className="flex items-center gap-2 rounded-md px-2.5 py-2">
              <HugeiconsIcon icon={File01Icon} className="size-3.5" /> Documents
            </div>
          </div>
          <p className="px-2.5 pt-7 pb-2 text-[10px] font-medium tracking-wide text-zinc-600 uppercase">
            Teams
          </p>
          <div className="flex items-center gap-2 rounded-md px-2.5 py-2 text-zinc-300">
            <span className="size-2.5 rounded-[3px] bg-violet-400" />{" "}
            Engineering
          </div>
          <div className="flex items-center gap-2 rounded-md px-2.5 py-2 text-zinc-400">
            <span className="size-2.5 rounded-[3px] bg-sky-400" /> Design
          </div>
          <div className="mt-auto flex items-center gap-2 rounded-md px-2.5 py-2">
            <HugeiconsIcon icon={Settings01Icon} className="size-3.5" />{" "}
            Settings
          </div>
        </aside>
        <div className="min-w-0 flex-1">
          <div className="flex h-12 items-center justify-between border-b border-white/[0.075] px-4 sm:px-6">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span className="hidden sm:inline">Projects</span>
              <span className="hidden text-zinc-600 sm:inline">/</span>
              <span className="font-medium text-zinc-100">Orbit Platform</span>
            </div>
            <div className="flex items-center gap-3 text-zinc-500">
              <HugeiconsIcon icon={UserMultipleIcon} className="size-3.5" />
              <HugeiconsIcon icon={MoreHorizontalIcon} className="size-4" />
            </div>
          </div>
          <div className="px-4 pt-6 sm:px-7 sm:pt-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="mb-2 flex items-center gap-2 text-[10px] font-medium text-violet-300">
                  <span className="size-1.5 rounded-full bg-violet-400" /> In
                  progress
                </div>
                <h3 className="text-[19px] font-semibold tracking-[-0.04em] text-zinc-50 sm:text-2xl">
                  Orbit Platform
                </h3>
                <p className="mt-1 text-[11px] text-zinc-500 sm:text-xs">
                  A better way to plan and move work forward.
                </p>
              </div>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-md border border-white/10 px-2.5 py-1.5 text-[10px] text-zinc-300",
                )}
              >
                <HugeiconsIcon icon={Activity01Icon} className="size-3" />{" "}
                Project overview{" "}
                <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3" />
              </span>
            </div>
            <div className="mt-7 grid gap-5 border-y border-white/[0.075] py-4 sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="flex items-center gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                  <HugeiconsIcon icon={Progress01Icon} className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center justify-between gap-4 text-[10px] text-zinc-400">
                    <span>Project progress</span>
                    <span className="font-medium text-zinc-200">68%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[68%] rounded-full bg-violet-400" />
                  </div>
                </div>
              </div>
              <div
                className="hidden items-center -space-x-1.5 sm:flex"
                aria-hidden="true"
              >
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full border-2 border-[#121217] bg-[#334155] text-[10px] text-white",
                  )}
                >
                  SK
                </span>
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full border-2 border-[#121217] bg-[#44345c] text-[10px] text-white",
                  )}
                >
                  AD
                </span>
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full border-2 border-[#121217] bg-[#34544d] text-[10px] text-white",
                  )}
                >
                  JR
                </span>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between gap-2 pb-3 text-[11px] font-semibold text-zinc-200">
              <span>
                Work items <span className="ml-1 text-zinc-600">4</span>
              </span>
              <span className="text-zinc-500">All work</span>
            </div>
            <div className="pb-5">
              {tasks.map((task) => (
                <div
                  key={task.key}
                  className="flex min-h-12 items-center gap-3 border-t border-white/[0.06] py-2 text-[11px]"
                >
                  <span
                    className={cn("size-2.5 shrink-0 rounded-full", task.mark)}
                    aria-hidden="true"
                  />
                  <span className="hidden w-[58px] shrink-0 text-zinc-600 sm:block">
                    {task.key}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-zinc-200">
                    {task.title}
                  </span>
                  <span className="hidden rounded border border-white/[0.08] px-1.5 py-1 text-[10px] text-zinc-500 md:inline">
                    {task.tag}
                  </span>
                  <span className="hidden w-[72px] text-right text-zinc-500 lg:block">
                    {task.status}
                  </span>
                  {task.status === "Done" ? (
                    <HugeiconsIcon
                      icon={Tick02Icon}
                      className="size-3.5 text-emerald-400"
                    />
                  ) : (
                    <span className="size-3.5" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
