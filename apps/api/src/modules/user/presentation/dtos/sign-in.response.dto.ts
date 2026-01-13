import { ApiProperty } from '@nestjs/swagger'
import type { UserResponseDto } from '@/modules/user/application'

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
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string

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
  data: UserResponseDto

  @ApiProperty({
    description: 'Authentication tokens',
  })
  tokens: TokenResponseDto

  @ApiProperty({
    description: 'Session identifier',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  sessionId: string
}
