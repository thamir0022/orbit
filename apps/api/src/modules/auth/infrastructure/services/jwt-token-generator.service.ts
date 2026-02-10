import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as jwt from 'jsonwebtoken'
import type {
  AccessTokenPayload,
  AccessTokenResult,
  ITokenGenerator,
  RefreshTokenPayload,
  RefreshTokenResult,
} from '../../application'

/**
 * JWT Token Generator (Adapter)
 *
 * INFRASTRUCTURE LAYER - Implements the ITokenGenerator port
 *
 * Encapsulates JWT library and configuration details.
 */
@Injectable()
export class JwtTokenGenerator implements ITokenGenerator {
  private readonly accessTokenSecret: string
  private readonly refreshTokenSecret: string
  private readonly accessTokenExpiresIn: number
  private readonly refreshTokenExpiresIn: number

  constructor(private readonly _config: ConfigService) {
    this.accessTokenSecret = this._config.get<string>(
      'JWT_ACCESS_SECRET',
      'access-secret'
    )
    this.refreshTokenSecret = this._config.get<string>(
      'JWT_REFRESH_SECRET',
      'refresh-secret'
    )
    this.accessTokenExpiresIn = Number(
      this._config.get<number>('JWT_ACCESS_EXPIRES_IN', 900)
    )
    this.refreshTokenExpiresIn = Number(
      this._config.get<number>('JWT_REFRESH_EXPIRES_IN', 604800)
    )
  }

  generateAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiresIn,
    })
  }

  generateRefreshToken(payload: RefreshTokenPayload): string {
    return jwt.sign(payload, this.refreshTokenSecret, {
      expiresIn: this.refreshTokenExpiresIn,
    })
  }

  verifyAccessToken(token: string): AccessTokenResult | null {
    try {
      return jwt.verify(token, this.accessTokenSecret) as AccessTokenResult
    } catch {
      return null
    }
  }

  verifyRefreshToken(token: string): RefreshTokenResult | null {
    try {
      return jwt.verify(token, this.refreshTokenSecret) as RefreshTokenResult
    } catch {
      return null
    }
  }
}
