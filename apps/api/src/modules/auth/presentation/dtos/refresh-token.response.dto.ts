import { ApiProperty } from '@nestjs/swagger'

export class RefreshTokenResponseDto {
  @ApiProperty()
  success: boolean

  @ApiProperty()
  message: string

  @ApiProperty()
  data: {
    accessToken: string
    accessTokenExpiresAt: Date
    sessionId: string
  }
}
