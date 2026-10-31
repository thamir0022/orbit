import type { Metadata } from "next";

import { LandingPage } from "@/components/landing/landing-page";

/** Root marketing route. The existing app layout and global fonts are untouched. */
export const metadata: Metadata = {
  title: "Orbit - Your team's work. In perfect orbit.",
  description:
    "Projects, work items, sprints, and knowledge. One clear workspace to help teams stay aligned and move forward.",
  openGraph: {
    title: "Orbit - A clearer way to work together",
    description: "Bring plans, people, and progress into a single workspace.",
    type: "website",
  },
};

export default function HomePage() {
  return <LandingPage />;
}
