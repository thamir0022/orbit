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
  userId: string;
  email: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ITokenGenerator {
  generateAccessToken(payload: TokenPayload): string;
  generateRefreshToken(payload: TokenPayload): string;
  generateTokenPair(payload: TokenPayload): TokenPair;
  verifyAccessToken(token: string): TokenPayload | null;
  verifyRefreshToken(token: string): TokenPayload | null;
}

export const TOKEN_GENERATOR = Symbol("ITokenGenerator")