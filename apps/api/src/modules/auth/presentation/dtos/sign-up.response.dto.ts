import { ApiProperty } from '@nestjs/swagger'

/**
 * Sign Up Response DTO
 * Wraps the response with success flag and message
 */
export class SignUpResponseDto {
  @ApiProperty({
    description: 'Refresh token',
  })
  refreshToken: string
}
