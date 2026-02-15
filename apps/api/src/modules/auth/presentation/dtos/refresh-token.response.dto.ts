import { ApiProperty } from '@nestjs/swagger'

export class RefreshTokenResponseDto {
  @ApiProperty({
    description: 'Access Token',
  })
  accessToken: string
}
