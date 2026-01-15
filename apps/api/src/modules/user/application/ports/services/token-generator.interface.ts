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

export interface TokenPayload {
  userId: string
  email: string
}

export interface ITokenGenerator {
  generateAccessToken(payload: TokenPayload): string
  generateRefreshToken(payload: TokenPayload): string
  verifyAccessToken(token: string): TokenPayload | null
  verifyRefreshToken(token: string): TokenPayload | null
  accessTokenExpiry: number
  refreshTokenExpiry: number
}

export const TOKEN_GENERATOR = Symbol('ITokenGenerator')
