import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

import { SprintStatus } from '../../../../domain/enums/sprint-status.enum'
import { SprintListItemOutput } from '../../../../application/contracts/sprint-list-item.output'
import { UserSummaryResponseDto } from '@/shared/presentation/dtos/responses/user-summary.response'

/**
 * HTTP response representation of a sprint.
 *
 * This class is intentionally kept separate from the application
 * read model so presentation concerns such as Swagger metadata
 * do not leak into the application layer.
 */
export class SprintResponse implements SprintListItemOutput {
  @ApiProperty({
    description: 'Unique identifier of the sprint',
    format: 'uuid',
    example: '0192f8c4-7a1b-7c32-8f4d-123456789abc',
  })
  id!: string

  @ApiProperty({
    description: 'Sprint name',
    example: 'Authentication & Onboarding',
  })
  name!: string

  @ApiPropertyOptional({
    description: 'Short objective the sprint aims to achieve',
    example: 'Complete the new authentication and onboarding flow.',
  })
  goal?: string

  @ApiProperty({
    description: 'Current lifecycle status of the sprint',
    enum: SprintStatus,
    example: SprintStatus.PLANNED,
  })
  status!: SprintStatus

  @ApiProperty({
    description: 'Sprint start date and time',
    format: 'date-time',
    example: '2026-10-01T09:00:00.000Z',
  })
  startDate!: Date

  @ApiProperty({
    description: 'Sprint end date and time',
    format: 'date-time',
    example: '2026-10-14T17:00:00.000Z',
  })
  endDate!: Date

  @ApiProperty({
    description: 'Story points committed to the sprint during planning',
    nullable: true,
    example: 34,
  })
  committedPoints!: number | null

  @ApiProperty({
    description: 'Story points completed in the sprint',
    nullable: true,
    example: 29,
  })
  completedPoints!: number | null

  @ApiProperty({
    description: 'User who created the sprint',
    type: () => UserSummaryResponseDto,
  })
  createdBy!: UserSummaryResponseDto

  @ApiProperty({
    description: 'Timestamp when the sprint was started',
    nullable: true,
    format: 'date-time',
    example: '2026-10-01T09:05:00.000Z',
  })
  startedAt!: Date | null

  @ApiProperty({
    description: 'Timestamp when the sprint was completed',
    nullable: true,
    format: 'date-time',
    example: '2026-10-14T16:45:00.000Z',
  })
  completedAt!: Date | null

  @ApiProperty({
    description: 'Timestamp when the sprint was cancelled',
    nullable: true,
    format: 'date-time',
    example: '2026-10-07T12:30:00.000Z',
  })
  cancelledAt!: Date | null

  @ApiProperty({
    description: 'User who cancelled the sprint',
    type: () => UserSummaryResponseDto,
    nullable: true,
  })
  cancelledBy!: UserSummaryResponseDto | null

  @ApiProperty({
    description: 'Timestamp when the sprint was created',
    format: 'date-time',
    example: '2026-09-28T10:00:00.000Z',
  })
  createdAt!: Date

  @ApiProperty({
    description: 'Timestamp when the sprint was last updated',
    format: 'date-time',
    example: '2026-09-30T15:20:00.000Z',
  })
  updatedAt!: Date
}
