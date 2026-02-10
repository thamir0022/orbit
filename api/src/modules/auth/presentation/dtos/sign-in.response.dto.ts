import { ApiProperty } from '@nestjs/swagger'
import type { AuthenticatedUser } from '../../application/dto/sign-in.result'

/**
 * Sign In Response DTO
 */
export class SignInResponseDto {
  @ApiProperty({
    description: 'Authenticated User data',
  })
  user: AuthenticatedUser

  @ApiProperty({
    description: 'Tokens and its expiry dates',
  })
  tokens: {
    accessToken: string
    accessTokenExpiresIn: number
  }

  @ApiProperty({ description: 'User session ID' })
  sessionId: string
}
