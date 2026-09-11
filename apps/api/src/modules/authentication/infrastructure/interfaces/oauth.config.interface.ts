export interface IOAuthConfig {
  googleClientId: string
  googleClientSecret: string
  googleCallbackUrl: string
}

export const OAUTH_CONFIG = Symbol('IOAuthConfig')
