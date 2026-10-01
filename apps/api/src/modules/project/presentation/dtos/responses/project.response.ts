import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

import { ProjectPriority } from '../../../domain/enums/project-priority.enum'
import { ProjectStage } from '../../../domain/enums/project-stage.enum'
import { ProjectStatus } from '../../../domain/enums/project-status.enum'
import { ProjectType } from '../../../domain/enums/project-type.enum'

import { ProjectListItemOutput } from '../../../application/contracts/project-list-item.output'

import { UserSummaryResponseDto } from '@/shared/presentation/dtos/responses/user-summary.response'

/**
 * HTTP response representation of a project.
 *
 * This class is intentionally kept separate from the application
 * read model so presentation concerns such as Swagger metadata
 * do not leak into the application layer.
 */
export class ProjectResponse implements ProjectListItemOutput {
  @ApiProperty({
    description: 'Unique identifier of the project',
    format: 'uuid',
    example: '0192f8c4-7a1b-7c32-8f4d-123456789abc',
  })
  id!: string

  @ApiProperty({
    description: 'Project name',
    example: 'Orbit Project Management',
  })
  name!: string

  @ApiProperty({
    description: 'Unique project key within the workspace',
    example: 'ORB',
  })
  key!: string

  @ApiPropertyOptional({
    description: 'Project description',
    example: 'Project management platform for modern agile teams.',
  })
  description?: string

  @ApiPropertyOptional({
    description: 'Project avatar URL',
    format: 'uri',
    example: 'https://example.com/project-avatar.png',
  })
  avatarUrl?: string

  @ApiProperty({
    description: 'Project type',
    enum: ProjectType,
    example: ProjectType.PRODUCT,
  })
  type!: ProjectType

  @ApiProperty({
    description: 'Current project lifecycle stage',
    enum: ProjectStage,
    example: ProjectStage.PROPOSAL,
  })
  stage!: ProjectStage

  @ApiProperty({
    description: 'Current project priority',
    enum: ProjectPriority,
    example: ProjectPriority.NO_PRIORITY,
  })
  priority!: ProjectPriority

  @ApiProperty({
    description: 'Current project lifecycle status',
    enum: ProjectStatus,
    example: ProjectStatus.ACTIVE,
  })
  status!: ProjectStatus

  @ApiProperty({
    description: 'User responsible for leading the project',
    type: () => UserSummaryResponseDto,
    nullable: true,
  })
  lead!: UserSummaryResponseDto | null

  @ApiProperty({
    description: 'User who created the project',
    type: () => UserSummaryResponseDto,
  })
  createdBy!: UserSummaryResponseDto

  @ApiProperty({
    description: 'Project start date and time',
    format: 'date-time',
    nullable: true,
    example: '2026-10-01T09:00:00.000Z',
  })
  startDate!: Date | null

  @ApiProperty({
    description: 'Target project completion date and time',
    format: 'date-time',
    nullable: true,
    example: '2026-12-31T17:00:00.000Z',
  })
  targetEndDate!: Date | null

  @ApiProperty({
    description: 'Timestamp when the project was created',
    format: 'date-time',
    example: '2026-09-28T10:00:00.000Z',
  })
  createdAt!: Date

  @ApiProperty({
    description: 'Timestamp when the project was last updated',
    format: 'date-time',
    example: '2026-09-30T15:20:00.000Z',
  })
  updatedAt!: Date
}
