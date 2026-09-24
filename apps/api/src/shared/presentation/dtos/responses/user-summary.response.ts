import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class UserSummaryResponseDto {
  @ApiProperty({
    description: 'Unique user identifier',
    format: 'uuid',
    example: '0192f8c4-7a1b-7c32-8f4d-123456789abc',
  })
  id!: string

  @ApiProperty({
    description: 'User display name',
    example: 'John Doe',
  })
  displayName!: string

  @ApiPropertyOptional({
    description: 'User avatar URL',
    example: 'https://example.com/avatars/john-doe.png',
    format: 'uri',
    nullable: true,
  })
  avatarUrl!: string | null
}
