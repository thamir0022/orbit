import { ApiProperty } from '@nestjs/swagger'
import { AuthenticatedUser } from '../../application/interfaces/auth.interface'

/**
 * Sign Up Response DTO
 * Wraps the response with success flag and message
 */
export class SignUpResponseDto {
  @ApiProperty({ description: 'Operation success status', example: true })
  success: boolean

  @ApiProperty({
    description: 'Response message',
    example: 'Account registered successfully',
  })
  message: string

  @ApiProperty({ description: 'User data' })
  data: {
    user: AuthenticatedUser
    accessToken: string
    sessionId: string
    accessTokenExpiresAt: Date
  }
}
