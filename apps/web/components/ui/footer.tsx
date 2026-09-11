"use client";

import { FC } from "react";
import { motion, Variants } from "motion/react";
import { Fascinate } from "next/font/google";
import { cn } from "@/lib/utils";

const footerData = [
  {
    title: "Pages",
    links: [
      { name: "All Products", href: "#" },
      { name: "Studio", href: "#" },
      { name: "Clients", href: "#" },
      { name: "Pricing", href: "#" },
      { name: "Blog", href: "#" },
    ],
  },
  {
    title: "Socials",
    links: [
      { name: "Facebook", href: "#" },
      { name: "Instagram", href: "#" },
      { name: "Twitter", href: "#" },
      { name: "LinkedIn", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Service", href: "#" },
      { name: "Cookie Policy", href: "#" },
    ],
  },
  {
    title: "Register",
    links: [
      { name: "Sign Up", href: "#" },
      { name: "Login", href: "#" },
      { name: "Forgot Password", href: "#" },
    ],
  },
];

// Animation Variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 100,
    },
  },
};

const fascinate = Fascinate({
  weight: "400",
  subsets: ["latin"],
});

const Footer: FC = () => {
  return (
    <footer className="bg-black text-white pt-32 pb-10 relative overflow-hidden font-sans">
      <motion.div
        className="max-w-[1400px] mx-auto px-8 relative z-10"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {/* Top Section: Grid with Logo and Links */}
        <div className="grid grid-cols-12 gap-y-16 gap-x-8 mb-32">
          {/* Logo Column - Small Brand Name */}
          <motion.div
            variants={itemVariants}
            className="col-span-12 lg:col-span-4 flex flex-col gap-6"
          >
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center transition-transform duration-500 group-hover:rotate-[10deg]">
                <span className="font-bold text-black text-2xl uppercase">
                  O
                </span>
              </div>
              <span className="font-bold text-3xl tracking-tighter">Orbit</span>
            </div>
            <p className="text-neutral-500 text-sm max-w-[300px] leading-relaxed">
              The next-generation agile platform for teams that ship faster,
              together.
              <br />
              <span className="mt-4 block opacity-50 italic">
                © 2026 Orbit Labs Inc.
              </span>
            </p>
          </motion.div>

          {/* Link Columns - Staggered Animation */}
          {footerData.map((column) => (
            <motion.div
              key={column.title}
              variants={itemVariants}
              className="col-span-6 md:col-span-3 lg:col-span-2 flex flex-col gap-6"
            >
              <h3 className="font-semibold text-white text-sm tracking-widest uppercase opacity-40">
                {column.title}
              </h3>
              <ul className="flex flex-col gap-4">
                {column.links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-neutral-400 hover:text-white transition-all duration-300 text-[15px] hover:translate-x-1 inline-block"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Section: Static Screen-Sized Brand Name */}
        <div className="relative w-full border-t border-white/5 pt-12 pointer-events-none select-none">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
            {/* The Responsive Logo (Masked to match text color) */}
            <div
              className="shrink-0 transition-colors duration-500 bg-neutral-900 dark:bg-[#0a0a0a]"
              style={{
                width: "clamp(80px, 15vw, 250px)", // Scales from 80px to 250px based on viewport
                height: "clamp(40px, 8vw, 120px)",
                // This makes the logo take the color of the div's background
                WebkitMaskImage: 'url("/orbit-logo.webp")',
                maskImage: 'url("/orbit-logo.webp")',
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskPosition: "center",
                maskPosition: "center",
                filter: "drop-shadow(0px -10px 40px rgba(255,255,255,0.02))",
              }}
            />

            {/* The Responsive Brand Name */}
            <h2
              className={cn(
                fascinate.className,
                "font-extrabold leading-none text-center tracking-tighter transition-colors duration-500",
                "text-neutral-900 dark:text-[#0a0a0a]", // Matches the logo background color
              )}
              style={{
                // clamp(min, preferred, max) - Keeps it perfect on all screens
                fontSize: "clamp(4rem, 18vw, 22vw)",
                filter: "drop-shadow(0px -10px 40px rgba(255,255,255,0.02))",
              }}
            >
              Orbit
            </h2>
          </div>
        </div>
      </motion.div>
    </footer>
  );
};

export default Footer;
