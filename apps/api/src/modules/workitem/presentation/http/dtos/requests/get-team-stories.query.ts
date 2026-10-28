import { WorkItemQuerySortField } from '../../../../application/ports/work-item-query-repository.port'
import { WorkItemPriority } from '../../../../domain/enums/work-item-priority.enum'
import { WorkItemStatus } from '../../../../domain/enums/work-item-status.enum'

import { PaginatedSearchRequest } from '@/shared/presentation/dtos/requests/paginated-search.request'
import { ApiPropertyOptional } from '@nestjs/swagger'

import { Transform } from 'class-transformer'
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsIn,
  IsOptional,
  IsUUID,
} from 'class-validator'

const WORK_ITEM_SORT_FIELDS = [
  'key',
  'title',
  'status',
  'priority',
  'storyPoints',
  'dueDate',
  'createdAt',
  'updatedAt',
] as const satisfies readonly WorkItemQuerySortField[]

function transformCommaSeparatedValues({
  value,
}: {
  readonly value: unknown
}): unknown {
  const values = Array.isArray(value) ? value : [value]

  return values
    .flatMap((item: unknown) =>
      typeof item === 'string' ? item.split(',') : [item]
    )
    .map((item: unknown) => (typeof item === 'string' ? item.trim() : item))
    .filter((item: unknown) => item !== '')
}

export class GetTeamStoriesQuery extends PaginatedSearchRequest {
  @ApiPropertyOptional({
    description: 'Filter stories by one or more statuses.',
    enum: WorkItemStatus,
    isArray: true,
    example: [WorkItemStatus.BACKLOG, WorkItemStatus.IN_PROGRESS],
  })
  @Transform(transformCommaSeparatedValues)
  @IsOptional()
  @IsArray({
    message: 'Statuses must be an array.',
  })
  @ArrayMaxSize(10, {
    message: 'You can filter by at most 10 statuses.',
  })
  @ArrayUnique({
    message: 'Statuses must be unique.',
  })
  @IsEnum(WorkItemStatus, {
    each: true,
    message: 'Each status must be a valid work item status.',
  })
  readonly statuses?: WorkItemStatus[]

  @ApiPropertyOptional({
    description: 'Filter stories by one or more priorities.',
    enum: WorkItemPriority,
    isArray: true,
    example: [WorkItemPriority.HIGH, WorkItemPriority.URGENT],
  })
  @Transform(transformCommaSeparatedValues)
  @IsOptional()
  @IsArray({
    message: 'Priorities must be an array.',
  })
  @ArrayMaxSize(10, {
    message: 'You can filter by at most 10 priorities.',
  })
  @ArrayUnique({
    message: 'Priorities must be unique.',
  })
  @IsEnum(WorkItemPriority, {
    each: true,
    message: 'Each priority must be a valid work item priority.',
  })
  readonly priorities?: WorkItemPriority[]

  @ApiPropertyOptional({
    description: 'Filter stories by assignee UUID v7.',
    format: 'uuid',
    example: '0192f8c4-7a1b-7c32-8f4d-123456789abd',
  })
  @Transform(({ value }): unknown =>
    typeof value === 'string' ? value.trim() : value
  )
  @IsOptional()
  @IsUUID('7', {
    message: 'Assignee ID must be a valid UUID v7.',
  })
  readonly assigneeId?: string

  @ApiPropertyOptional({
    description: 'Field used to sort the stories.',
    enum: WORK_ITEM_SORT_FIELDS,
    example: 'createdAt',
  })
  @Transform(({ value }): unknown =>
    typeof value === 'string' ? value.trim() : value
  )
  @IsOptional()
  @IsIn(WORK_ITEM_SORT_FIELDS, {
    message: 'Invalid work item sort field.',
  })
  readonly sortField?: WorkItemQuerySortField
}
