/**
 * Session Token Generator Interface (Port)
 *
 * APPLICATION LAYER port defining JWT token operations for the multi-tenant architecture.
 * Infrastructure layer implements this with the actual JWT library.
 *
 * Architecture Context:
 * - Identity Session: Long-lived global session (Proves WHO the user is).
 * - Tenant Session: Short-lived, workspace-scoped session (Proves WHAT the user can do right now).
 */

import { JwtSignOptions } from '@nestjs/jwt'

export interface RefreshTokenPayload {
  jti: string // JWT Token ID (Used for token blacklisting if needed)
  sub: string // Subject - Global User ID
  sid: string // Global Session ID (Used to force-logout a device across all tenants)
}

export interface AccessTokenPayload {
  jti: string // JWT Token ID
  sub: string // Subject - Global User ID (Must match the Identity Session)
  tid?: string // Tenant ID (The active workspace)
}

interface JwtStandardClaims {
  iat: number // Issued At (Timestamp)
  exp: number // Expiration Time (Timestamp)
  iss?: string // Issuer (e.g., 'api.orbit.com')
  aud?: string // Audience (e.g., 'app.orbit.com')
}

export type WithJwtMeta<T> = T & JwtStandardClaims

export type RefreshTokenResult = WithJwtMeta<RefreshTokenPayload>
export type AccessTokenResult = WithJwtMeta<AccessTokenPayload>

export interface ITokenGenerator {
  /**
   * Generates the long-lived Global Refresh Token.
   * Typically set as the `refresh_token` HTTP-Only cookie.
   */
  generateRefreshToken(
    payload: RefreshTokenPayload,
    options?: JwtSignOptions
  ): Promise<string>

  /**
   * Generates the short-lived Workspace-scoped Token.
   * Typically set as the `access_token` HTTP-Only cookie.
   */
  generateAccessToken(
    payload: AccessTokenPayload,
    options?: JwtSignOptions
  ): Promise<string>

  /**
   * Verifies the cryptographic signature and expiration of the Refresh Token.
   * Returns null if invalid or expired.
   */
  verifyRefreshToken(token: string): Promise<RefreshTokenResult | null>

  /**
   * Verifies the cryptographic signature and expiration of the Tenant Token.
   * Returns null if invalid or expired.
   */
  verifyAccessToken(token: string): Promise<AccessTokenResult | null>

  /**
   * Decodes the Refresh Token payload WITHOUT verifying the signature.
   */
  decodeRefreshToken(token: string): RefreshTokenResult | null

  /**
   * Decodes the Tenant Token payload WITHOUT verifying the signature.
   */
  decodeAccessToken(token: string): AccessTokenResult | null
}

// Renamed the injection token to match the new Domain language
export const TOKEN_GENERATOR = Symbol('ITokenGenerator')
