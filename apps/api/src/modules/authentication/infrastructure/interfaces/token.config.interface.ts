export interface ITokenConfig {
  refreshTokenSecret: string
  refreshTokenExpiresIn: string | number // e.g., '7d' or 604800
  AccessTokenSecret: string
  AccessTokenExpiresIn: string | number // e.g., '15m' or 900
  issuer: string // e.g., 'api.orbit.com'
  audience: string // e.g., 'app.orbit.com'
}

export const TOKEN_CONFIG = Symbol('ITokenConfig')
