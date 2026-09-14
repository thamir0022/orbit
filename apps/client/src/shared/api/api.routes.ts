export const API_ROUTES = {
  AUTH: {
    SIGN_IN: '/auth/sign-in',
    SIGN_UP_INITIATE: '/auth/sign-up/initiate',
    SIGN_UP_OTP_RESEND: '/auth/sign-up/resend',
    SIGN_UP_VERIFY: '/auth/sign-up/verify',
    SIGN_UP_DETAILS: '/auth/sign-up/details',
    SIGN_UP_COMPLETE: '/auth/sign-up/complete',
    COMPLETE_REGISTRATION: '/auth/complete-registration',
    RESET_PASSWORD_REQUEST: '/auth/password-reset/request',
    RESET_PASSWORD_VERIFY: '/auth/password-reset/verify',
    RESET_PASSWORD_CONFIRM: '/auth/password-reset/confirm',
    RESET_PASSWORD_RESEND: '/auth/password-reset/resend',
    EXCHANGE: '/auth/exchange',
    SIGN_OUT: '/auth/sign-out',
  },
  USERS: {
    ME: '/users/me',
    UPDATE_PROFILE: '/users',
  },
  WORKSPACES: {
    PERMISSIONS: {
      ALL: '/workspaces/permissions',
    },
    CREATE: '/workspaces',
    ALL: '/workspaces',
    MEMBERS: {
      ALL: (query: string) => `/workspaces/members${query}`,
      UPDATE: (id: string) => `/workspaces/members/${id}`,
      REMOVE: (id: string) => `/workspaces/members/${id}/remove`,
    },
    ROLES: {
      ROLE: (id: string) => `/workspaces/roles/${id}`,
      ALL: '/workspaces/roles/',
      CREATE: '/workspaces/roles/',
      UPDATE: (id: string) => `/workspaces/roles/${id}`,
      DELETE: (id: string) => `/workspaces/roles/${id}`,
    },
    ACTIVE: '/workspaces/active',
    UPDATE_WORKSPACE: '/workspaces',
    GET_ROLES: '/workspaces/roles/', // Need to remove
    CREATE_INVITATION: '/workspaces/invite/',
    GET_ALL_INVITATION: '/workspaces/invitation/',
    GET_INVITATION: (token: string) => `/workspaces/invite/${token}`,
    ACCEPT_INVITATION: (token: string) => `/workspaces/invite/${token}/accept`,
  },

  PROJECTS: {
    ALL: `/projects`,
    PROJECT: (projectId: string) => `/projects/${projectId}`,
  },
} as const

// Export types for your routes
export type ApiRoutes = typeof API_ROUTES
