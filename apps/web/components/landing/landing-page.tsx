import { cn } from "cn";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Features } from "./features";
import { FinalCta } from "./final-cta";
import { Hero } from "./hero";
import { Footer } from "./footer";
import { Header } from "./header";
import { TeamsSection } from "./teams";
import { WorkflowSection } from "./workflow";

/** Server-rendered page; only the navigation and Laser Flow layer hydrate. */
export function LandingPage() {
  return (
    <ScrollArea className="scroll-smooth h-dvh w-full bg-[#09090b] text-white selection:bg-violet-500/30 selection:text-white">
      <div className="min-h-screen">
        <a
          href="#main-content"
          className={cn(
            "sr-only z-[100] rounded-md bg-white px-4 py-2 text-sm font-medium text-zinc-950 focus:not-sr-only focus:fixed focus:top-3 focus:left-3",
          )}
        >
          Skip to content
        </a>
        <Header />
        <main id="main-content">
          <Hero />
          <Features />
          <WorkflowSection />
          <TeamsSection />
          <FinalCta />
        </main>
        <Footer />
      </div>
    </ScrollArea>
  );
}
