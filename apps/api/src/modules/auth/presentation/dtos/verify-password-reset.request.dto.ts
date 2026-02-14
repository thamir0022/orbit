import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty } from 'class-validator'

export class VerifyPasswordResetRequestDto {
  @ApiProperty({
    description: 'User emal address',
    example: 'john.doe@example.com',
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string

  @ApiProperty({
    description: 'Otp',
    example: '123456',
  })
  @IsNotEmpty({ message: 'OTP is required' })
  otp: string
}
