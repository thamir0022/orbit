import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsDate,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator'

import { WorkItemQuerySortField } from '@/modules/workitem/application/ports/work-item-query-repository.port'

import { PaginatedSearchRequest } from '@/shared/presentation/dtos/requests/paginated-search.request'

import { WorkItemPriority } from '../../../../domain/enums/work-item-priority.enum'
import { WorkItemStatus } from '../../../../domain/enums/work-item-status.enum'
import { WorkItemType } from '../../../../domain/enums/work-item-type.enum'
import { trim } from '@/shared/utils'

const WORK_ITEM_SORT_FIELDS = [
  'key',
  'number',
  'title',
  'type',
  'status',
  'priority',
  'storyPoints',
  'dueDate',
  'createdAt',
  'updatedAt',
] as const

export class GetWorkItemsQuery extends PaginatedSearchRequest {
  // ---------------------------------------------------------------------------
  // Project
  // ---------------------------------------------------------------------------

  @ApiPropertyOptional({
    description: 'Filter work items by project ID.',
    format: 'uuid',
    example: '0192f8c4-7a1b-7c32-8f4d-123456789abd',
  })
  @Transform(trim)
  @IsOptional()
  @IsUUID('7', {
    message: 'Project ID must be a valid UUID v7',
  })
  readonly projectId?: string

  // ---------------------------------------------------------------------------
  // Team
  // ---------------------------------------------------------------------------

  @ApiPropertyOptional({
    description: 'Filter work items by team ID.',
    format: 'uuid',
    example: '0192f8c4-7a1b-7c32-8f4d-123456789abe',
  })
  @Transform(trim)
  @IsOptional()
  @IsUUID('7', {
    message: 'Team ID must be a valid UUID v7',
  })
  readonly teamId?: string

  // ---------------------------------------------------------------------------
  // Sprint
  // ---------------------------------------------------------------------------

  @ApiPropertyOptional({
    description: 'Filter work items by sprint ID.',
    format: 'uuid',
    example: '0192f8c4-7a1b-7c32-8f4d-123456789abf',
  })
  @Transform(trim)
  @IsOptional()
  @IsUUID('7', {
    message: 'Sprint ID must be a valid UUID v7',
  })
  readonly sprintId?: string

  // ---------------------------------------------------------------------------
  // Assignee
  // ---------------------------------------------------------------------------

  @ApiPropertyOptional({
    description: 'Filter work items assigned to a specific user.',
    format: 'uuid',
    example: '0192f8c4-7a1b-7c32-8f4d-123456789ac0',
  })
  @Transform(trim)
  @IsOptional()
  @IsUUID('7', {
    message: 'Assignee ID must be a valid UUID v7',
  })
  readonly assigneeId?: string

  // ---------------------------------------------------------------------------
  // Parent
  // ---------------------------------------------------------------------------

  @ApiPropertyOptional({
    description: 'Filter work items by parent work item ID.',
    format: 'uuid',
    example: '0192f8c4-7a1b-7c32-8f4d-123456789ac1',
  })
  @Transform(trim)
  @IsOptional()
  @IsUUID('7', {
    message: 'Parent ID must be a valid UUID v7',
  })
  readonly parentId?: string

  // ---------------------------------------------------------------------------
  // Type
  // ---------------------------------------------------------------------------

  @ApiPropertyOptional({
    description: 'Filter work items by a single work item type.',
    enum: WorkItemType,
    example: WorkItemType.STORY,
  })
  @Transform(trim)
  @IsOptional()
  @IsEnum(WorkItemType, {
    message: 'Type must be a valid work item type',
  })
  readonly type?: WorkItemType

  @ApiPropertyOptional({
    description:
      'Filter by multiple work item types. Supports comma-separated or repeated query parameters.',
    enum: WorkItemType,
    isArray: true,
    example: [WorkItemType.STORY, WorkItemType.BUG],
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
    message: 'You can filter by at most 10 work item types',
  })
  @ArrayUnique({
    message: 'Types must be unique',
  })
  @IsEnum(WorkItemType, {
    each: true,
    message: 'Each type must be a valid work item type',
  })
  readonly types?: WorkItemType[]

  // ---------------------------------------------------------------------------
  // Status
  // ---------------------------------------------------------------------------

  @ApiPropertyOptional({
    description: 'Filter work items by a single status.',
    enum: WorkItemStatus,
    example: WorkItemStatus.IN_PROGRESS,
  })
  @Transform(trim)
  @IsOptional()
  @IsEnum(WorkItemStatus, {
    message: 'Status must be a valid work item status',
  })
  readonly status?: WorkItemStatus

  @ApiPropertyOptional({
    description:
      'Filter by multiple work item statuses. Supports comma-separated or repeated query parameters.',
    enum: WorkItemStatus,
    isArray: true,
    example: [WorkItemStatus.TODO, WorkItemStatus.IN_PROGRESS],
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
    message: 'You can filter by at most 10 work item statuses',
  })
  @ArrayUnique({
    message: 'Statuses must be unique',
  })
  @IsEnum(WorkItemStatus, {
    each: true,
    message: 'Each status must be a valid work item status',
  })
  readonly statuses?: WorkItemStatus[]

  // ---------------------------------------------------------------------------
  // Priority
  // ---------------------------------------------------------------------------

  @ApiPropertyOptional({
    description: 'Filter work items by a single priority.',
    enum: WorkItemPriority,
    example: WorkItemPriority.HIGH,
  })
  @Transform(trim)
  @IsOptional()
  @IsEnum(WorkItemPriority, {
    message: 'Priority must be a valid work item priority',
  })
  readonly priority?: WorkItemPriority

  @ApiPropertyOptional({
    description:
      'Filter by multiple work item priorities. Supports comma-separated or repeated query parameters.',
    enum: WorkItemPriority,
    isArray: true,
    example: [WorkItemPriority.MEDIUM, WorkItemPriority.HIGH],
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
    message: 'You can filter by at most 10 work item priorities',
  })
  @ArrayUnique({
    message: 'Priorities must be unique',
  })
  @IsEnum(WorkItemPriority, {
    each: true,
    message: 'Each priority must be a valid work item priority',
  })
  readonly priorities?: WorkItemPriority[]

  // ---------------------------------------------------------------------------
  // Story points
  // ---------------------------------------------------------------------------

  @ApiPropertyOptional({
    description: 'Minimum story points.',
    minimum: 1,
    maximum: 1000,
    example: 3,
  })
  @Transform(trim)
  @Type(() => Number)
  @IsOptional()
  @IsInt({
    message: 'Story points from must be an integer',
  })
  @Min(1, {
    message: 'Story points from must be at least 1',
  })
  @Max(1000, {
    message: 'Story points from must not exceed 1000',
  })
  readonly storyPointsFrom?: number

  @ApiPropertyOptional({
    description: 'Maximum story points.',
    minimum: 1,
    maximum: 1000,
    example: 13,
  })
  @Transform(trim)
  @Type(() => Number)
  @IsOptional()
  @IsInt({
    message: 'Story points to must be an integer',
  })
  @Min(1, {
    message: 'Story points to must be at least 1',
  })
  @Max(1000, {
    message: 'Story points to must not exceed 1000',
  })
  readonly storyPointsTo?: number

  // ---------------------------------------------------------------------------
  // Started date
  // ---------------------------------------------------------------------------

  @ApiPropertyOptional({
    description:
      'Return work items started on or after this ISO 8601 date-time.',
    format: 'date-time',
    example: '2026-10-01T00:00:00.000Z',
  })
  @Transform(trim)
  @Type(() => Date)
  @IsOptional()
  @IsDate({
    message: 'Start date from must be a valid date',
  })
  readonly startDateFrom?: Date

  @ApiPropertyOptional({
    description:
      'Return work items started on or before this ISO 8601 date-time.',
    format: 'date-time',
    example: '2026-12-31T23:59:59.999Z',
  })
  @Transform(trim)
  @Type(() => Date)
  @IsOptional()
  @IsDate({
    message: 'Start date to must be a valid date',
  })
  readonly startDateTo?: Date

  // ---------------------------------------------------------------------------
  // Due date
  // ---------------------------------------------------------------------------

  @ApiPropertyOptional({
    description: 'Return work items due on or after this ISO 8601 date-time.',
    format: 'date-time',
    example: '2026-10-01T00:00:00.000Z',
  })
  @Transform(trim)
  @Type(() => Date)
  @IsOptional()
  @IsDate({
    message: 'Due date from must be a valid date',
  })
  readonly dueDateFrom?: Date

  @ApiPropertyOptional({
    description: 'Return work items due on or before this ISO 8601 date-time.',
    format: 'date-time',
    example: '2026-12-31T23:59:59.999Z',
  })
  @Transform(trim)
  @Type(() => Date)
  @IsOptional()
  @IsDate({
    message: 'Due date to must be a valid date',
  })
  readonly dueDateTo?: Date

  // ---------------------------------------------------------------------------
  // Completed date
  // ---------------------------------------------------------------------------

  @ApiPropertyOptional({
    description:
      'Return work items completed on or after this ISO 8601 date-time.',
    format: 'date-time',
    example: '2026-10-01T00:00:00.000Z',
  })
  @Transform(trim)
  @Type(() => Date)
  @IsOptional()
  @IsDate({
    message: 'Completed date from must be a valid date',
  })
  readonly completedDateFrom?: Date

  @ApiPropertyOptional({
    description:
      'Return work items completed on or before this ISO 8601 date-time.',
    format: 'date-time',
    example: '2026-12-31T23:59:59.999Z',
  })
  @Transform(trim)
  @Type(() => Date)
  @IsOptional()
  @IsDate({
    message: 'Completed date to must be a valid date',
  })
  readonly completedDateTo?: Date

  // ---------------------------------------------------------------------------
  // Sorting
  // ---------------------------------------------------------------------------

  @ApiPropertyOptional({
    description: 'Field used to sort work item results.',
    enum: WORK_ITEM_SORT_FIELDS,
    default: 'createdAt',
    example: 'createdAt',
  })
  @Transform(trim)
  @IsOptional()
  @IsIn(WORK_ITEM_SORT_FIELDS, {
    message: 'Invalid work item sort field',
  })
  readonly sortField?: WorkItemQuerySortField
}
