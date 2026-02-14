import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class ConfirmPasswordResetRequestDto {
  @ApiProperty({
    description: 'Reset token',
    example: 'jhadffd8ad8adfadsf7a9dsfadfa798',
  })
  @IsNotEmpty()
  resetToken: string

  @ApiProperty({
    description: 'New password of the user',
    example: 'newpass@1234',
  })
  @IsNotEmpty()
  newPassword: string
}
