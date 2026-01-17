/**
 * Token Generator Interface (Port)
 *
 * APPLICATION LAYER port defining JWT token operations.
 * Infrastructure layer implements this with actual JWT library.
 *
 * Why here?
 * - Token generation is an infrastructure concern (JWT library)
 * - Application layer needs tokens for authentication flow
 * - Domain layer has no knowledge of authentication mechanisms
 */

export interface AccessTokenPayload {
  sub: string // Subject - User Id
  email: string
  sid: string // Session Id
}

export interface RefreshTokenPayload {
  sub: string // Subject - User Id
  sid: string // Session Id
}

interface JwtStandardClaims {
  jti: string
  iat: number
  exp: number
}

export type WithJwtMeta<T> = T & JwtStandardClaims

export type AccessTokenResult = WithJwtMeta<AccessTokenPayload>
export type RefreshTokenResult = WithJwtMeta<RefreshTokenPayload>

export interface ITokenGenerator {
  generateAccessToken(payload: AccessTokenPayload): string
  generateRefreshToken(payload: RefreshTokenPayload): string
  verifyAccessToken(token: string): AccessTokenResult | null
  verifyRefreshToken(token: string): RefreshTokenResult | null
  accessTokenTTL(now?: number): Date
  refreshTokenTTL(now?: number): Date
}

export const TOKEN_GENERATOR = Symbol('ITokenGenerator')
