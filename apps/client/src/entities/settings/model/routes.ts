export const routes = {
  settings: {
    general: (slug: string) => `/${slug}/settings`,
    profile: (slug: string) => `/${slug}/settings/profile`,
    workspace: (slug: string) => `/${slug}/settings/workspace`,
    security: (slug: string) => `/${slug}/settings/security`,
    roles: (slug: string) => `/${slug}/settings/roles`,
    members: (slug: string) => `/${slug}/settings/members`,
    billing: (slug: string) => `/${slug}/settings/billing`,
    notifications: (slug: string) => `/${slug}/settings/notifications`,
  },
} as const
