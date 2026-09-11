import LightRays from "@/components/ui/LightRays";
import { OrbitNavbar } from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import HeroSection from "@/components/ui/hero-section";
import { Metadata } from "next";

// This is fully parsed by search engines instantly!
export const metadata: Metadata = {
  title: "Orbit | The Agile Platform for Modern Teams",
  description:
    "One workspace. Zero friction. Infinite velocity. The agile platform built for modern, fast, and elite teams. Start for free today.",
  openGraph: {
    title: "Orbit | The Agile Platform for Modern Teams",
    description:
      "One workspace. Zero friction. Infinite velocity. The agile platform built for modern, fast, and elite teams. Start for free today.",
    type: "website",
    url: "https://yourwebsite.com",
    // Add an OG image for social sharing
    // images: ["https://yourwebsite.com/og-image.png"],
  },
};

const HomePage = () => {
  return (
    <div className="relative min-h-screen bg-black flex flex-col">
      {/* Navbar */}
      <div className="relative z-50">
        <OrbitNavbar />
      </div>

      {/* Background LightRays */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <LightRays
          raysOrigin="top-center"
          raysColor="#ffffff"
          raysSpeed={1}
          lightSpread={0.5}
          rayLength={3}
          followMouse={true}
          mouseInfluence={0.1}
          className="w-full h-full"
        />
      </div>

      {/* Hero Content */}
      <HeroSection />

      {/* Footer */}
      <div className="relative z-20 mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default HomePage;
