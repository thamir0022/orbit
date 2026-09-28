import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsDate,
  IsEnum,
  IsIn,
  IsOptional,
  IsUUID,
} from 'class-validator'

import { SprintStatus } from '../../../../domain/enums/sprint-status.enum'
import { SprintQuerySortField } from '../../../../application/ports/sprint-query-repository.port'
import { PaginatedSearchRequest } from '@/shared/presentation/dtos/requests/paginated-search.request'

const SPRINT_SORT_FIELDS = [
  'name',
  'startDate',
  'endDate',
  'status',
  'createdAt',
  'updatedAt',
] as const

export class GetSprintsQuery extends PaginatedSearchRequest {
  @ApiPropertyOptional({
    description: 'Filter sprints by team ID.',
    format: 'uuid',
    example: '0192f8c4-7a1b-7c32-8f4d-123456789abd',
  })
  @Transform(({ value }): unknown =>
    typeof value === 'string' ? value.trim() : value
  )
  @IsOptional()
  @IsUUID('7', {
    message: 'Team ID must be a valid UUID v7',
  })
  readonly teamId?: string

  @ApiPropertyOptional({
    description: 'Filter sprints by a single lifecycle status.',
    enum: SprintStatus,
    example: SprintStatus.ACTIVE,
  })
  @Transform(({ value }): unknown =>
    typeof value === 'string' ? value.trim() : value
  )
  @IsOptional()
  @IsEnum(SprintStatus, {
    message: 'Status must be a valid sprint status',
  })
  readonly status?: SprintStatus

  @ApiPropertyOptional({
    description:
      'Filter by multiple sprint statuses. Supports comma-separated or repeated query parameters.',
    enum: SprintStatus,
    isArray: true,
    example: [SprintStatus.PLANNED, SprintStatus.ACTIVE],
  })
  @Transform(({ value }): unknown => {
    const input: unknown = value

    if (Array.isArray(input)) {
      return input
        .flatMap((item: unknown): unknown[] =>
          typeof item === 'string' ? item.split(',') : [item]
        )
        .map((item: unknown): unknown =>
          typeof item === 'string' ? item.trim() : item
        )
        .filter((item: unknown) => item !== '')
    }

    if (typeof input === 'string') {
      return input
        .split(',')
        .map((item: string) => item.trim())
        .filter((item: string) => item !== '')
    }

    return input
  })
  @IsOptional()
  @IsArray({
    message: 'Statuses must be an array',
  })
  @ArrayMaxSize(4, {
    message: 'You can filter by at most 4 statuses',
  })
  @ArrayUnique({
    message: 'Statuses must be unique',
  })
  @IsEnum(SprintStatus, {
    each: true,
    message: 'Each status must be a valid sprint status',
  })
  readonly statuses?: SprintStatus[]

  @ApiPropertyOptional({
    description: 'Return sprints starting on or after this ISO 8601 date-time.',
    format: 'date-time',
    example: '2026-10-01T00:00:00.000Z',
  })
  @Transform(({ value }): unknown =>
    typeof value === 'string' ? value.trim() : value
  )
  @Type(() => Date)
  @IsOptional()
  @IsDate({
    message: 'Start date from must be a valid date',
  })
  readonly startDateFrom?: Date

  @ApiPropertyOptional({
    description:
      'Return sprints starting on or before this ISO 8601 date-time.',
    format: 'date-time',
    example: '2026-12-31T23:59:59.999Z',
  })
  @Transform(({ value }): unknown =>
    typeof value === 'string' ? value.trim() : value
  )
  @Type(() => Date)
  @IsOptional()
  @IsDate({
    message: 'Start date to must be a valid date',
  })
  readonly startDateTo?: Date

  @ApiPropertyOptional({
    description: 'Return sprints ending on or after this ISO 8601 date-time.',
    format: 'date-time',
    example: '2026-10-01T00:00:00.000Z',
  })
  @Transform(({ value }): unknown =>
    typeof value === 'string' ? value.trim() : value
  )
  @Type(() => Date)
  @IsOptional()
  @IsDate({
    message: 'End date from must be a valid date',
  })
  readonly endDateFrom?: Date

  @ApiPropertyOptional({
    description: 'Return sprints ending on or before this ISO 8601 date-time.',
    format: 'date-time',
    example: '2026-12-31T23:59:59.999Z',
  })
  @Transform(({ value }): unknown =>
    typeof value === 'string' ? value.trim() : value
  )
  @Type(() => Date)
  @IsOptional()
  @IsDate({
    message: 'End date to must be a valid date',
  })
  readonly endDateTo?: Date

  @ApiPropertyOptional({
    description: 'Field used to sort sprint results.',
    enum: SPRINT_SORT_FIELDS,
    default: 'startDate',
    example: 'startDate',
  })
  @Transform(({ value }): unknown =>
    typeof value === 'string' ? value.trim() : value
  )
  @IsOptional()
  @IsIn(SPRINT_SORT_FIELDS, {
    message: 'Invalid sprint sort field',
  })
  readonly sortField?: SprintQuerySortField
}
