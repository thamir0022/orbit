import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator'

import { WorkItemPriority } from '../../../../domain/enums/work-item-priority.enum'
import { WorkItemStatus } from '../../../../domain/enums/work-item-status.enum'
import { WorkItemType } from '../../../../domain/enums/work-item-type.enum'

/**
 * Request body for updating a work item.
 *
 * All fields are optional because the endpoint supports partial updates.
 */
export class UpdateWorkItemRequest {
  // ---------------------------------------------------------------------------
  // Type
  // ---------------------------------------------------------------------------

  @ApiPropertyOptional({
    description: 'Work item type.',
    enum: WorkItemType,
    example: WorkItemType.STORY,
  })
  @Transform(({ value }): unknown =>
    typeof value === 'string' ? value.trim() : value
  )
  @IsOptional()
  @IsEnum(WorkItemType, {
    message: 'Type must be a valid work item type',
  })
  readonly type?: WorkItemType

  // ---------------------------------------------------------------------------
  // Title
  // ---------------------------------------------------------------------------

  @ApiPropertyOptional({
    description: 'Work item title.',
    minLength: 1,
    maxLength: 255,
    example: 'Implement workspace member invitation',
  })
  @Transform(({ value }): unknown =>
    typeof value === 'string' ? value.trim() : value
  )
  @IsOptional()
  @IsNotEmpty({
    message: 'Title must not be empty',
  })
  @MinLength(1, {
    message: 'Title must be at least 1 character',
  })
  @MaxLength(255, {
    message: 'Title must not exceed 255 characters',
  })
  readonly title?: string

  // ---------------------------------------------------------------------------
  // Description
  // ---------------------------------------------------------------------------

  @ApiPropertyOptional({
    description: 'Detailed work item description.',
    nullable: true,
    maxLength: 5000,
    example: 'Implement invitation flow for workspace members.',
  })
  @Transform(({ value }): unknown => {
    if (value === null) {
      return null
    }

    return typeof value === 'string' ? value.trim() : value
  })
  @IsOptional()
  @MaxLength(5000, {
    message: 'Description must not exceed 5000 characters',
  })
  readonly description?: string | null

  // ---------------------------------------------------------------------------
  // Acceptance criteria
  // ---------------------------------------------------------------------------

  @ApiPropertyOptional({
    description: 'Acceptance criteria for the work item.',
    type: [String],
    nullable: true,
    maxItems: 50,
    example: [
      'User receives an invitation email',
      'Invitation token expires correctly',
    ],
  })
  @Transform(({ value }): unknown => {
    if (value === null) {
      return null
    }

    if (!Array.isArray(value)) {
      return value
    }

    return value
      .filter((item: unknown) => typeof item === 'string')
      .map((item: string) => item.trim())
      .filter((item: string) => item !== '')
  })
  @IsOptional()
  @IsArray({
    message: 'Acceptance criteria must be an array',
  })
  @ArrayMaxSize(50, {
    message: 'You can provide at most 50 acceptance criteria',
  })
  @ArrayUnique({
    message: 'Acceptance criteria must be unique',
  })
  @MaxLength(1000, {
    each: true,
    message: 'Each acceptance criterion must not exceed 1000 characters',
  })
  readonly acceptanceCriteria?: readonly string[]

  // ---------------------------------------------------------------------------
  // Parent
  // ---------------------------------------------------------------------------

  @ApiPropertyOptional({
    description: 'Parent work item ID.',
    format: 'uuid',
    nullable: true,
    example: '0192f8c4-7a1b-7c32-8f4d-123456789abd',
  })
  @Transform(({ value }): unknown => {
    if (value === null) {
      return null
    }

    return typeof value === 'string' ? value.trim() : value
  })
  @IsOptional()
  @IsUUID('7', {
    message: 'Parent ID must be a valid UUID v7',
  })
  readonly parentId?: string | null

  // ---------------------------------------------------------------------------
  // Status
  // ---------------------------------------------------------------------------

  @ApiPropertyOptional({
    description: 'Work item status.',
    enum: WorkItemStatus,
    example: WorkItemStatus.IN_PROGRESS,
  })
  @Transform(({ value }): unknown =>
    typeof value === 'string' ? value.trim() : value
  )
  @IsOptional()
  @IsEnum(WorkItemStatus, {
    message: 'Status must be a valid work item status',
  })
  readonly status?: WorkItemStatus

  // ---------------------------------------------------------------------------
  // Priority
  // ---------------------------------------------------------------------------

  @ApiPropertyOptional({
    description: 'Work item priority.',
    enum: WorkItemPriority,
    nullable: true,
    example: WorkItemPriority.HIGH,
  })
  @Transform(({ value }): unknown => {
    if (value === null) {
      return null
    }

    return typeof value === 'string' ? value.trim() : value
  })
  @IsOptional()
  @IsEnum(WorkItemPriority, {
    message: 'Priority must be a valid work item priority',
  })
  readonly priority?: WorkItemPriority | null

  // ---------------------------------------------------------------------------
  // Sprint
  // ---------------------------------------------------------------------------

  @ApiPropertyOptional({
    description: 'Sprint ID assigned to the work item.',
    format: 'uuid',
    nullable: true,
    example: '0192f8c4-7a1b-7c32-8f4d-123456789abe',
  })
  @Transform(({ value }): unknown => {
    if (value === null) {
      return null
    }

    return typeof value === 'string' ? value.trim() : value
  })
  @IsOptional()
  @IsUUID('7', {
    message: 'Sprint ID must be a valid UUID v7',
  })
  readonly sprintId?: string | null

  // ---------------------------------------------------------------------------
  // Assignee
  // ---------------------------------------------------------------------------

  @ApiPropertyOptional({
    description: 'User ID assigned to the work item.',
    format: 'uuid',
    nullable: true,
    example: '0192f8c4-7a1b-7c32-8f4d-123456789abf',
  })
  @Transform(({ value }): unknown => {
    if (value === null) {
      return null
    }

    return typeof value === 'string' ? value.trim() : value
  })
  @IsOptional()
  @IsUUID('7', {
    message: 'Assignee ID must be a valid UUID v7',
  })
  readonly assigneeId?: string | null

  // ---------------------------------------------------------------------------
  // Story points
  // ---------------------------------------------------------------------------

  @ApiPropertyOptional({
    description: 'Estimated story points.',
    minimum: 1,
    maximum: 1000,
    nullable: true,
    example: 5,
  })
  @Transform(({ value }): unknown => {
    if (value === null) {
      return null
    }

    return typeof value === 'string' ? value.trim() : value
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt({
    message: 'Story points must be an integer',
  })
  @Min(1, {
    message: 'Story points must be at least 1',
  })
  @Max(1000, {
    message: 'Story points must not exceed 1000',
  })
  readonly storyPoints?: number | null

  // ---------------------------------------------------------------------------
  // Started at
  // ---------------------------------------------------------------------------

  @ApiPropertyOptional({
    description: 'Date and time when the work item started.',
    format: 'date-time',
    nullable: true,
    example: '2026-10-02T10:00:00.000Z',
  })
  @Transform(({ value }): unknown => {
    if (value === null) {
      return null
    }

    return typeof value === 'string' ? value.trim() : value
  })
  @Type(() => Date)
  @IsOptional()
  @IsDate({
    message: 'Started at must be a valid date',
  })
  readonly startedAt?: Date | null

  // ---------------------------------------------------------------------------
  // Due date
  // ---------------------------------------------------------------------------

  @ApiPropertyOptional({
    description: 'Deadline for completing the work item.',
    format: 'date-time',
    nullable: true,
    example: '2026-10-15T23:59:59.999Z',
  })
  @Transform(({ value }): unknown => {
    if (value === null) {
      return null
    }

    return typeof value === 'string' ? value.trim() : value
  })
  @Type(() => Date)
  @IsOptional()
  @IsDate({
    message: 'Due date must be a valid date',
  })
  readonly dueDate?: Date | null

  // ---------------------------------------------------------------------------
  // Completed at
  // ---------------------------------------------------------------------------

  @ApiPropertyOptional({
    description: 'Date and time when the work item was completed.',
    format: 'date-time',
    nullable: true,
    example: '2026-10-14T16:30:00.000Z',
  })
  @Transform(({ value }): unknown => {
    if (value === null) {
      return null
    }

    return typeof value === 'string' ? value.trim() : value
  })
  @Type(() => Date)
  @IsOptional()
  @IsDate({
    message: 'Completed at must be a valid date',
  })
  readonly completedAt?: Date | null
}
