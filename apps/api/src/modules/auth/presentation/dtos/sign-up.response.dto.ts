import { ApiProperty } from '@nestjs/swagger'
import { type AuthenticatedUser } from '../../application/interfaces/auth.interface'

/**
 * Sign Up Response DTO
 * Wraps the response with success flag and message
 */
export class SignUpResponseDto {
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
