import { ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common'
import { JwtService, JwtSignOptions } from '@nestjs/jwt'
import {
  type ITokenGenerator,
  type RefreshTokenPayload,
  type AccessTokenPayload,
  type RefreshTokenResult,
  type AccessTokenResult,
} from '../../../application/ports/token-generator.interface'
import {
  type ITokenConfig,
  TOKEN_CONFIG,
} from '@/modules/authentication/infrastructure/interfaces/token.config.interface'

@Injectable()
export class JwtTokenGenerator implements ITokenGenerator {
  private readonly logger = new Logger(JwtTokenGenerator.name)

  constructor(
    private readonly jwtService: JwtService,
    @Inject(TOKEN_CONFIG)
    private readonly config: ITokenConfig
  ) {}

  /* -------------------------------------------------------------------------- */
  /* Token Generation                                                           */
  /* -------------------------------------------------------------------------- */

  async generateRefreshToken(
    payload: RefreshTokenPayload,
    options?: JwtSignOptions
  ): Promise<string> {
    return await this.jwtService.signAsync(payload, {
      secret: options?.secret ?? this.config.refreshTokenSecret,
      expiresIn:
        options?.expiresIn ??
        (this.config.refreshTokenExpiresIn as JwtSignOptions['expiresIn']),
      issuer: options?.issuer ?? this.config.issuer,
      audience: options?.audience ?? this.config.audience,
    })
  }

  async generateAccessToken(
    payload: AccessTokenPayload,
    options?: JwtSignOptions
  ): Promise<string> {
    return await this.jwtService.signAsync(payload, {
      secret: options?.secret ?? this.config.AccessTokenSecret,
      expiresIn:
        options?.expiresIn ??
        (this.config.AccessTokenExpiresIn as JwtSignOptions['expiresIn']),
      issuer: options?.issuer ?? this.config.issuer,
      audience: options?.audience ?? this.config.audience,
    })
  }

  /* -------------------------------------------------------------------------- */
  /* Token Verification (Validates Signature & Expiration)                      */
  /* -------------------------------------------------------------------------- */

  async verifyRefreshToken(token: string): Promise<RefreshTokenResult | null> {
    try {
      const decoded = await this.jwtService.verifyAsync<RefreshTokenResult>(
        token,
        {
          secret: this.config.refreshTokenSecret,
          issuer: this.config.issuer,
          audience: this.config.audience,
        }
      )

      return decoded
    } catch (error: unknown) {
      this.logger.error(
        `Refresh Token verification failed, ${error instanceof Error && error.message}`
      )

      throw new ForbiddenException('Refresh Token verification failed')
    }
  }

  async verifyAccessToken(token: string): Promise<AccessTokenResult | null> {
    try {
      const decoded = await this.jwtService.verifyAsync<AccessTokenResult>(
        token,
        {
          secret: this.config.AccessTokenSecret,
          issuer: this.config.issuer,
          audience: this.config.audience,
        }
      )
      return decoded
    } catch (error: unknown) {
      this.logger.error(
        `Tenant token verification failed, ${error instanceof Error && error.message}`
      )

      throw new ForbiddenException('Tenant token verification failed')
    }
  }

  /* -------------------------------------------------------------------------- */
  /* Token Decoding (Reads payload without verifying signature)                 */
  /* -------------------------------------------------------------------------- */

  decodeRefreshToken(token: string): RefreshTokenResult | null {
    const decoded = this.jwtService.decode<RefreshTokenResult | null>(token)
    return decoded
  }

  decodeAccessToken(token: string): AccessTokenResult | null {
    const decoded = this.jwtService.decode<AccessTokenResult | null>(token)
    return decoded
  }
}
