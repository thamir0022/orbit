import { Request } from 'express'

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

export interface AuthenticatedRequest extends Request {
  identity: RefreshTokenPayload
  tenant: AccessTokenPayload
}
