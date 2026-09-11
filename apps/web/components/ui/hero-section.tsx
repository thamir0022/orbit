"use client";

import { cn } from "@/lib/utils";
import { FlipWords } from "@/components/ui/flip-words";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { TextEffect } from "@/components/ui/text-effect";
import { Gruppo, Martel_Sans, Quicksand } from "next/font/google";
import { motion, Variants } from "motion/react";
import { Button } from "./button";
import Link from "next/link";

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const gruppo = Gruppo({
  subsets: ["latin"],
  weight: "400",
});

const martelSans = Martel_Sans({
  weight: "400",
  subsets: ["latin"],
});

export default function HeroSection() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 100,
      },
    },
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-center px-4 text-center pointer-events-none select-none min-h-[90vh]">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl space-y-8 pointer-events-auto py-20"
      >
        <motion.h1
          variants={itemVariants}
          className={cn(
            quicksand.className,
            "text-center text-white text-4xl sm:text-6xl md:text-7xl font-bold tracking-tighter leading-tight",
          )}
        >
          The Agile platform for <br />
          <FlipWords
            className="px-4 bg-white/10 backdrop-blur-2xl backdrop-saturate-150 border border-white/20 shadow-2xl rounded-3xl text-blue-600"
            words={[
              "Modern",
              "Fast",
              "Next Gen",
              "GOATed",
              "Cracked",
              "Locked In",
              "Turbo",
              "Elite",
            ]}
          />
          <span className="ml-2">teams</span>
        </motion.h1>

        <motion.div variants={itemVariants}>
          <TextEffect
            per="word"
            as="h2"
            preset="blur"
            delay={1}
            className={cn(
              gruppo.className,
              "text-gray-400 text-lg sm:text-xl md:text-2xl max-w-2xl mx-auto font-medium tracking-wide",
            )}
          >
            One workspace. Zero friction. Infinite velocity.
          </TextEffect>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className={cn(
            martelSans.className,
            "flex flex-col sm:flex-row items-center justify-center gap-6 pt-4",
          )}
        >
          {/* <button className="relative inline-flex h-12 overflow-hidden rounded-full p-px focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
            <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
            <span className="text-xl inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-black px-3 py-2 font-medium text-white backdrop-blur-3xl">
              Get Started Now
            </span>
          </button> */}
          <Link href={'http://localhost:3000/sign-up'} target="_blank" className="text-xl bg-white p-5">
            Get Started Now
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
