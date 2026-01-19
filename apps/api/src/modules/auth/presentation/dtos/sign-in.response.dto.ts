import { ApiProperty } from '@nestjs/swagger'
import type { UserResponseDto } from '../../application'

/**
 * Sign In Response DTO
 */
export class SignInResponseDto {
  @ApiProperty({
    description: 'Operation success status',
    example: true,
  })
  success: boolean

  @ApiProperty({
    description: 'Response message',
    example: 'Sign in successful',
  })
  message: string

  @ApiProperty({
    description: 'User data',
  })
  data: {
    user: UserResponseDto
    accessToken: string
    sessionId: string
    accessTokenExpiresAt: Date
  }
}
