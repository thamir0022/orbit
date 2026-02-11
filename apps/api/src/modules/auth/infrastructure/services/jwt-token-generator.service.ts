import { Inject, Injectable } from '@nestjs/common'
import * as jwt from 'jsonwebtoken'
import type {
  AccessTokenPayload,
  AccessTokenResult,
  ITokenGenerator,
  RefreshTokenPayload,
  RefreshTokenResult,
} from '../../application'
import { JWT_CONFIG, type IJwtConfig } from '../interfaces/jwt.config.interface'

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

  constructor(
    @Inject(JWT_CONFIG)
    private readonly _config: IJwtConfig
  ) {
    this.accessTokenSecret = this._config.accessTokenSecret
    this.refreshTokenSecret = this._config.refreshTokenSecret

    this.accessTokenExpiresIn = this._config.accessTokenExpiresIn
    this.refreshTokenExpiresIn = this._config.refreshTokenExpiresIn
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
