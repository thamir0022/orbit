import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { TeamStatus } from '../../../domain/enums/team-status.enum'

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
  avatar?: string

  @ApiProperty({
    description: 'Current team status',
    enum: TeamStatus,
    enumName: 'TeamStatus',
    example: TeamStatus.ACTIVE,
  })
  status!: TeamStatus

  @ApiPropertyOptional({
    description: 'User identifier of the team lead',
    format: 'uuid',
    example: '0192f8c4-7a1b-7c32-8f4d-123456789abc',
    nullable: true,
  })
  leadId?: string

  @ApiProperty({
    description: 'User identifier of the user who created the team',
    format: 'uuid',
    example: '0192f8c4-7a1b-7c32-8f4d-123456789abc',
  })
  createdBy!: string

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
