"use client";

import { cn } from "cn";
import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

// React Bits is intentionally isolated from the server-rendered marketing page.
const LaserFlow = dynamic(() => import("@/components/LaserFlow"), {
  ssr: false,
  loading: () => null,
});

interface HeroLaserProps {
  intro: ReactNode;
  children: ReactNode;
}

export function HeroLaser({ intro, children }: HeroLaserProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [motionAllowed, setMotionAllowed] = useState(false);

  useEffect(() => {
    const reducedData = window.matchMedia("(prefers-reduced-data: reduce)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () =>
      setMotionAllowed(!reducedData.matches && !reducedMotion.matches);

    update();
    reducedData.addEventListener("change", update);
    reducedMotion.addEventListener("change", update);

    return () => {
      reducedData.removeEventListener("change", update);
      reducedMotion.removeEventListener("change", update);
    };
  }, []);

  return (
    <div className="relative isolate w-full">
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-[7%] -top-40 h-[500px] rounded-full bg-violet-600/[0.13] blur-[110px]",
        )}
      />
      {motionAllowed && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 -top-32 -bottom-20 z-0 w-screen -translate-x-1/2 overflow-hidden"
        >
          <LaserFlow
            surfaceRef={previewRef}
            beamPosition={0.68}
            surfaceLevel={1}
            color="#3847ff"
            intensity={1.8}
            beamWidth={1.5}
            flare={1.5}
            spread={1.18}
            spill={0.5}
            fog={0.2}
            dust={1.6}
            revealImage="/product-bg.jpg"
            revealRadius={220}
            revealOpacity={0.6}
            streaks={1.5}
            dots={1}
            pulse={1.5}
            speed={1.5}
            seed={3}
            mouseInteraction
            dpr={1.25}
            intro
          />
        </div>
      )}
      <div className="relative z-20">{intro}</div>
      <motion.div
        ref={previewRef}
        initial={false}
        whileHover={shouldReduceMotion ? undefined : { y: -3 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative rounded-xl z-10 w-full max-w-6xl"
      >
        {children}
      </motion.div>
    </div>
  );
}
