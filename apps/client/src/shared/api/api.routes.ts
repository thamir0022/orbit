export const API_ROUTES = {
  AUTH: {
    SIGN_IN: '/auth/sign-in',
    SIGN_UP_INITIATE: '/auth/sign-up/initiate',
    SIGN_UP_VERIFY: '/auth/sign-up/verify',
    SIGN_UP_DETAILS: '/auth/sign-up/details',
    SIGN_UP_COMPLETE: '/auth/sign-up/complete',
    REFRESH_TOKEN: '/auth/refresh',
  },
  USERS: {
    ME: '/users/me',
    UPDATE_PROFILE: '/users/profile',
  },
  ORGANIZATIONS: {
    CURRENT: '/current',
  },
} as const

// Export types for your routes
export type ApiRoutes = typeof API_ROUTES
