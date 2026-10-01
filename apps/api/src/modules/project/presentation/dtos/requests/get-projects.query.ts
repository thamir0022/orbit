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

import { ProjectQuerySortField } from '@/modules/project/application/ports/project-query-repository.port'

import { PaginatedSearchRequest } from '@/shared/presentation/dtos/requests/paginated-search.request'

import { ProjectType } from '../../../domain/enums/project-type.enum'
import { ProjectStage } from '../../../domain/enums/project-stage.enum'
import { ProjectPriority } from '../../../domain/enums/project-priority.enum'
import { ProjectStatus } from '../../../domain/enums/project-status.enum'

const PROJECT_SORT_FIELDS = [
  'name',
  'key',
  'type',
  'stage',
  'priority',
  'status',
  'startDate',
  'targetEndDate',
  'createdAt',
  'updatedAt',
] as const

export class GetProjectsQuery extends PaginatedSearchRequest {
  // ---------------------------------------------------------------------------
  // Type
  // ---------------------------------------------------------------------------

  @ApiPropertyOptional({
    description: 'Filter projects by a single project type.',
    enum: ProjectType,
    example: ProjectType.PRODUCT,
  })
  @Transform(({ value }): unknown =>
    typeof value === 'string' ? value.trim() : value
  )
  @IsOptional()
  @IsEnum(ProjectType, {
    message: 'Type must be a valid project type',
  })
  readonly type?: ProjectType

  @ApiPropertyOptional({
    description:
      'Filter by multiple project types. Supports comma-separated or repeated query parameters.',
    enum: ProjectType,
    isArray: true,
    example: [ProjectType.PRODUCT],
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
    message: 'Types must be an array',
  })
  @ArrayMaxSize(10, {
    message: 'You can filter by at most 10 project types',
  })
  @ArrayUnique({
    message: 'Types must be unique',
  })
  @IsEnum(ProjectType, {
    each: true,
    message: 'Each type must be a valid project type',
  })
  readonly types?: ProjectType[]

  // ---------------------------------------------------------------------------
  // Stage
  // ---------------------------------------------------------------------------

  @ApiPropertyOptional({
    description: 'Filter projects by a single lifecycle stage.',
    enum: ProjectStage,
    example: ProjectStage.PROPOSAL,
  })
  @Transform(({ value }): unknown =>
    typeof value === 'string' ? value.trim() : value
  )
  @IsOptional()
  @IsEnum(ProjectStage, {
    message: 'Stage must be a valid project stage',
  })
  readonly stage?: ProjectStage

  @ApiPropertyOptional({
    description:
      'Filter by multiple project stages. Supports comma-separated or repeated query parameters.',
    enum: ProjectStage,
    isArray: true,
    example: [ProjectStage.PROPOSAL],
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
    message: 'Stages must be an array',
  })
  @ArrayMaxSize(10, {
    message: 'You can filter by at most 10 project stages',
  })
  @ArrayUnique({
    message: 'Stages must be unique',
  })
  @IsEnum(ProjectStage, {
    each: true,
    message: 'Each stage must be a valid project stage',
  })
  readonly stages?: ProjectStage[]

  // ---------------------------------------------------------------------------
  // Priority
  // ---------------------------------------------------------------------------

  @ApiPropertyOptional({
    description: 'Filter projects by a single priority.',
    enum: ProjectPriority,
    example: ProjectPriority.NO_PRIORITY,
  })
  @Transform(({ value }): unknown =>
    typeof value === 'string' ? value.trim() : value
  )
  @IsOptional()
  @IsEnum(ProjectPriority, {
    message: 'Priority must be a valid project priority',
  })
  readonly priority?: ProjectPriority

  @ApiPropertyOptional({
    description:
      'Filter by multiple project priorities. Supports comma-separated or repeated query parameters.',
    enum: ProjectPriority,
    isArray: true,
    example: [ProjectPriority.NO_PRIORITY],
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
    message: 'Priorities must be an array',
  })
  @ArrayMaxSize(10, {
    message: 'You can filter by at most 10 project priorities',
  })
  @ArrayUnique({
    message: 'Priorities must be unique',
  })
  @IsEnum(ProjectPriority, {
    each: true,
    message: 'Each priority must be a valid project priority',
  })
  readonly priorities?: ProjectPriority[]

  // ---------------------------------------------------------------------------
  // Status
  // ---------------------------------------------------------------------------

  @ApiPropertyOptional({
    description: 'Filter projects by a single lifecycle status.',
    enum: ProjectStatus,
    example: ProjectStatus.ACTIVE,
  })
  @Transform(({ value }): unknown =>
    typeof value === 'string' ? value.trim() : value
  )
  @IsOptional()
  @IsEnum(ProjectStatus, {
    message: 'Status must be a valid project status',
  })
  readonly status?: ProjectStatus

  @ApiPropertyOptional({
    description:
      'Filter by multiple project statuses. Supports comma-separated or repeated query parameters.',
    enum: ProjectStatus,
    isArray: true,
    example: [ProjectStatus.ACTIVE],
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
  @ArrayMaxSize(10, {
    message: 'You can filter by at most 10 project statuses',
  })
  @ArrayUnique({
    message: 'Statuses must be unique',
  })
  @IsEnum(ProjectStatus, {
    each: true,
    message: 'Each status must be a valid project status',
  })
  readonly statuses?: ProjectStatus[]

  // ---------------------------------------------------------------------------
  // Lead
  // ---------------------------------------------------------------------------

  @ApiPropertyOptional({
    description: 'Filter projects by project lead user ID.',
    format: 'uuid',
    example: '0192f8c4-7a1b-7c32-8f4d-123456789abd',
  })
  @Transform(({ value }): unknown =>
    typeof value === 'string' ? value.trim() : value
  )
  @IsOptional()
  @IsUUID('7', {
    message: 'Lead ID must be a valid UUID v7',
  })
  readonly leadId?: string

  // ---------------------------------------------------------------------------
  // Start date
  // ---------------------------------------------------------------------------

  @ApiPropertyOptional({
    description:
      'Return projects starting on or after this ISO 8601 date-time.',
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
      'Return projects starting on or before this ISO 8601 date-time.',
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

  // ---------------------------------------------------------------------------
  // Target end date
  // ---------------------------------------------------------------------------

  @ApiPropertyOptional({
    description:
      'Return projects targeting completion on or after this ISO 8601 date-time.',
    format: 'date-time',
    example: '2026-10-01T00:00:00.000Z',
  })
  @Transform(({ value }): unknown =>
    typeof value === 'string' ? value.trim() : value
  )
  @Type(() => Date)
  @IsOptional()
  @IsDate({
    message: 'Target end date from must be a valid date',
  })
  readonly targetEndDateFrom?: Date

  @ApiPropertyOptional({
    description:
      'Return projects targeting completion on or before this ISO 8601 date-time.',
    format: 'date-time',
    example: '2026-12-31T23:59:59.999Z',
  })
  @Transform(({ value }): unknown =>
    typeof value === 'string' ? value.trim() : value
  )
  @Type(() => Date)
  @IsOptional()
  @IsDate({
    message: 'Target end date to must be a valid date',
  })
  readonly targetEndDateTo?: Date

  // ---------------------------------------------------------------------------
  // Sorting
  // ---------------------------------------------------------------------------

  @ApiPropertyOptional({
    description: 'Field used to sort project results.',
    enum: PROJECT_SORT_FIELDS,
    default: 'createdAt',
    example: 'createdAt',
  })
  @Transform(({ value }): unknown =>
    typeof value === 'string' ? value.trim() : value
  )
  @IsOptional()
  @IsIn(PROJECT_SORT_FIELDS, {
    message: 'Invalid project sort field',
  })
  readonly sortField?: ProjectQuerySortField
}
