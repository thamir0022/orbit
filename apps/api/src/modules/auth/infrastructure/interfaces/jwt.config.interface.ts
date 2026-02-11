export interface IJwtConfig {
  accessTokenSecret: string
  refreshTokenSecret: string
  accessTokenExpiresIn: number
  refreshTokenExpiresIn: number
  isProduction: boolean
}

export const JWT_CONFIG = Symbol('IJwtConfig')
