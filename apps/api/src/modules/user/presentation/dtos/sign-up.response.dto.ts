import { ApiProperty } from '@nestjs/swagger'
import { UserResponseDto } from '@/modules/user/application'

/**
 * Sign Up Response DTO
 * Wraps the response with success flag and message
 */
export class SignUpResponseDto {
  @ApiProperty({ description: 'Operation success status', example: true })
  success: boolean

  @ApiProperty({
    description: 'Response message',
    example: 'User registered successfully',
  })
  message: string

  @ApiProperty({ description: 'User data', type: UserResponseDto })
  data: UserResponseDto
}
