import { Request } from 'express'

export interface BaseAuthContext {
  userId: string
  sessionId: string
  tokenId: string
  workspaceId?: string
}

export interface RefreshAuthContext extends BaseAuthContext {
  type: 'refresh'
}

export interface AccessAuthContext extends BaseAuthContext {
  type: 'access'
}

export interface AuthCookies {
  access_token?: string
  refresh_token?: string
}

export type AuthContext = AccessAuthContext | RefreshAuthContext

export interface AuthenticatedRequest extends Request {
  cookies: AuthCookies
  auth?: AuthContext
}
