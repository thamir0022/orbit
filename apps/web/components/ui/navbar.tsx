"use client";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useState } from "react";
import OrbitLogo from "@/components/ui/orbit-logo";
import { Funnel_Display } from "next/font/google";
import { Button } from "./button";

const funnelDisplay = Funnel_Display({
  style: "normal",
  weight: "400",
});

export function OrbitNavbar() {
  const navItems = [
    {
      name: "Features",
      link: "#features",
    },
    {
      name: "Pricing",
      link: "#pricing",
    },
    {
      name: "Contact",
      link: "#contact",
    },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <Navbar className={funnelDisplay.className}>
      {/* Desktop Navigation */}
      <NavBody>
        <OrbitLogo size="small" theme="light" />
        <NavItems items={navItems} />
        <div className="flex items-center gap-4 z-20">
          <a
            href={process.env.NEXT_PUBLIC_SIGN_IN_URL}
            target="_blank"
            referrerPolicy="origin"
          >
            <Button className="cursor-pointer hover:scale-110 transition-all">
              Sign In
            </Button>
          </a>
        </div>
      </NavBody>

      {/* Mobile Navigation */}
      <MobileNav>
        <MobileNavHeader>
          <OrbitLogo size="small" theme="light" />
          <MobileNavToggle
            isOpen={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </MobileNavHeader>

        <MobileNavMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        >
          {navItems.map((item, idx) => (
            <a
              key={`mobile-link-${idx}`}
              href={item.link}
              onClick={() => setIsMobileMenuOpen(false)}
              className="relative text-neutral-600 dark:text-neutral-300"
            >
              <span className="block">{item.name}</span>
            </a>
          ))}
          <div className="w-full grid grid-cols-2 gap-2">
            <Button className="cursor-pointer">Sign In</Button>
            <Button className="cursor-pointer">Book a Call</Button>
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
