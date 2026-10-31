/** Centralized marketing navigation and application entry points. */
const appOrigin = (
  process.env.NEXT_PUBLIC_ORBIT_APP_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");

export const LANDING_PATHS = {
  home: "/",
  login: `${appOrigin}/sign-in`,
  signup: `${appOrigin}/sign-up`,
  features: "#features",
  workflow: "#workflow",
  teams: "#teams",
  overview: "#overview",
} as const;

export const navigation = [
  { label: "Product", href: LANDING_PATHS.overview },
  { label: "Features", href: LANDING_PATHS.features },
  { label: "How it works", href: LANDING_PATHS.workflow },
  { label: "For teams", href: LANDING_PATHS.teams },
] as const;

export const footerGroups = [
  {
    heading: "Product",
    links: [
      { label: "Overview", href: LANDING_PATHS.overview },
      { label: "Features", href: LANDING_PATHS.features },
      { label: "Workflow", href: LANDING_PATHS.workflow },
      { label: "For teams", href: LANDING_PATHS.teams },
    ],
  },
  {
    heading: "Get started",
    links: [
      { label: "Create an account", href: LANDING_PATHS.signup },
      { label: "Sign in", href: LANDING_PATHS.login },
    ],
  },
  {
    heading: "Explore",
    links: [
      { label: "Projects", href: "#projects" },
      { label: "Sprints", href: "#sprints" },
      { label: "Documents", href: "#documents" },
    ],
  },
] as const;
