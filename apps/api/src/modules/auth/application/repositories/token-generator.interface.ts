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
  jti: string // JWT Token Id
  sub: string // Subject - User Id
  email: string
  sid: string // Session Id
}

export interface RefreshTokenPayload {
  jti: string // JWT Token Id
  sub: string // Subject - User Id
  sid: string // Session Id
}

interface JwtStandardClaims {
  iat: number
  exp: number
}

export type WithJwtMeta<T> = T & JwtStandardClaims

export type AccessTokenResult = WithJwtMeta<AccessTokenPayload>
export type RefreshTokenResult = WithJwtMeta<RefreshTokenPayload>

export interface ITokenGenerator {
  generateAccessToken(payload: AccessTokenPayload): Promise<string>
  generateRefreshToken(payload: RefreshTokenPayload): Promise<string>
  verifyAccessToken(token: string): Promise<AccessTokenResult | null>
  verifyRefreshToken(token: string): Promise<RefreshTokenResult | null>
  decodeAccessToken(token: string): AccessTokenResult | null
  decodeRefreshToken(token: string): RefreshTokenResult | null
}

export const TOKEN_GENERATOR = Symbol('ITokenGenerator')
