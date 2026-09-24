import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

import { TeamStatus } from '../../../domain/enums/team-status.enum'
import { UserSummaryResponseDto } from '@/shared/presentation/dtos/responses/user-summary.response'

export class TeamResponseDto {
  @ApiProperty({
    description: 'Unique team identifier',
    format: 'uuid',
    example: '0192f8c4-7a1b-7c32-8f4d-123456789abc',
  })
  id!: string

  @ApiProperty({
    description: 'Team name',
    example: 'Engineering',
  })
  name!: string

  @ApiPropertyOptional({
    description: 'Team description',
    example: 'Product engineering and development team',
    nullable: true,
  })
  description?: string

  @ApiPropertyOptional({
    description: 'Team avatar URL',
    example: 'https://example.com/avatars/engineering.png',
    format: 'uri',
    nullable: true,
  })
  avatarUrl?: string

  @ApiProperty({
    description: 'Current team status',
    enum: TeamStatus,
    enumName: 'TeamStatus',
    example: TeamStatus.ACTIVE,
  })
  status!: TeamStatus

  @ApiPropertyOptional({
    description: 'Team lead',
    type: () => UserSummaryResponseDto,
    nullable: true,
  })
  lead!: UserSummaryResponseDto | null

  @ApiProperty({
    description: 'User who created the team',
    type: () => UserSummaryResponseDto,
  })
  createdBy!: UserSummaryResponseDto

  @ApiProperty({
    description: 'Team creation timestamp',
    type: String,
    format: 'date-time',
    example: '2026-09-23T09:30:00.000Z',
  })
  createdAt!: Date

  @ApiProperty({
    description: 'Team last update timestamp',
    type: String,
    format: 'date-time',
    example: '2026-09-23T09:30:00.000Z',
  })
  updatedAt!: Date
}
