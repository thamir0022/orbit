import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as jwt from 'jsonwebtoken'
import type {
  ITokenGenerator,
  TokenPayload,
  TokenPair,
} from '@/modules/user/application'

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

  constructor(private readonly configService: ConfigService) {
    this.accessTokenSecret = this.configService.get<string>(
      'JWT_ACCESS_SECRET',
      'access-secret'
    )
    this.refreshTokenSecret = this.configService.get<string>(
      'JWT_REFRESH_SECRET',
      'refresh-secret'
    )
    this.accessTokenExpiresIn = this.configService.get<number>(
      'JWT_ACCESS_EXPIRES_IN',
      900
    )
    this.refreshTokenExpiresIn = this.configService.get<number>(
      'JWT_REFRESH_EXPIRES_IN',
      604800
    )
  }

  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiresIn,
    })
  }

  generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.refreshTokenSecret, {
      expiresIn: this.refreshTokenExpiresIn,
    })
  }

  generateTokenPair(payload: TokenPayload): TokenPair {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
      expiresIn: this.accessTokenExpiresIn,
    }
  }

  verifyAccessToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, this.accessTokenSecret) as TokenPayload
    } catch {
      return null
    }
  }

  verifyRefreshToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, this.refreshTokenSecret) as TokenPayload
    } catch {
      return null
    }
  }
}
