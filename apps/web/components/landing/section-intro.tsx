import { cn } from "cn";
import type { ReactNode } from "react";

interface SectionIntroProps {
  eyebrow: string;
  title: string;
  description: string;
  id?: string;
  children?: ReactNode;
}

/** Consistent section headings without changing the app's font family. */
export function SectionIntro({
  eyebrow,
  title,
  description,
  id,
  children,
}: SectionIntroProps) {
  return (
    <div className="max-w-3xl">
      <p className="mb-5 text-xs font-semibold tracking-[0.16em] text-violet-300 uppercase">
        {eyebrow}
      </p>
      <h2
        id={id}
        className={cn(
          "text-balance text-[clamp(2.25rem,5vw,4.5rem)] leading-[1.06] font-semibold tracking-[-0.055em] text-zinc-50",
        )}
      >
        {title}
      </h2>
      <p className="mt-5 max-w-xl text-pretty text-base leading-7 text-zinc-400 sm:text-lg">
        {description}
      </p>
      {children}
    </div>
  );
}
