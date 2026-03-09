import { Inject, Injectable } from '@nestjs/common'
import type {
  AccessTokenPayload,
  AccessTokenResult,
  ITokenGenerator,
  RefreshTokenPayload,
  RefreshTokenResult,
} from '../../application'
import {
  JWT_ACCESS,
  JWT_REFRESH,
} from '../../application/constants/auth.constant'
import { JwtService } from '@nestjs/jwt'

/**
 * JWT Token Generator (Adapter)
 *
 * INFRASTRUCTURE LAYER - Implements the ITokenGenerator port
 *
 * Encapsulates JWT library and configuration details.
 */
@Injectable()
export class JwtTokenGenerator implements ITokenGenerator {
  constructor(
    @Inject(JWT_ACCESS)
    private readonly jwtAccess: JwtService,
    @Inject(JWT_REFRESH)
    private readonly jwtRefresh: JwtService
  ) {}

  async generateAccessToken(payload: AccessTokenPayload): Promise<string> {
    return await this.jwtAccess.signAsync(payload)
  }

  async generateRefreshToken(payload: RefreshTokenPayload): Promise<string> {
    return await this.jwtRefresh.signAsync(payload)
  }

  async verifyAccessToken(token: string): Promise<AccessTokenResult | null> {
    try {
      return await this.jwtAccess.verifyAsync<AccessTokenResult>(token)
    } catch {
      return null
    }
  }

  async verifyRefreshToken(token: string): Promise<RefreshTokenResult | null> {
    try {
      return await this.jwtRefresh.verifyAsync<RefreshTokenResult>(token)
    } catch {
      return null
    }
  }

  decodeAccessToken(token: string): AccessTokenResult | null {
    try {
      return this.jwtAccess.decode<AccessTokenResult>(token)
    } catch {
      return null
    }
  }

  decodeRefreshToken(token: string): RefreshTokenResult | null {
    try {
      return this.jwtRefresh.decode<RefreshTokenResult>(token)
    } catch {
      return null
    }
  }
}
