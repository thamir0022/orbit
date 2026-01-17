import { ApiProperty } from '@nestjs/swagger'
import type { UserResponseDto } from '../../application'

/**
 * Token Response DTO
 */
export class TokenResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string

  @ApiProperty({
    description: 'Access token expiration time in seconds',
    example: 900,
  })
  expiresIn: number
}

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
