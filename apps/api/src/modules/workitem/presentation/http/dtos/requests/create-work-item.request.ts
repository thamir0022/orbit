import { Type } from 'class-transformer'
import {
  ArrayMaxSize,
  IsArray,
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

import { WorkItemPriority } from '../../../../domain/enums/work-item-priority.enum'
import { WorkItemType } from '../../../../domain/enums/work-item-type.enum'

export class CreateWorkItemRequest {
  @ApiProperty({
    description: 'Project containing the work item.',
    format: 'uuid',
    example: '01996f1a-2f8b-7b9d-8f5e-1c4a6b7d8e90',
  })
  @IsUUID('7')
  readonly projectId!: string

  @ApiProperty({
    description: 'Team responsible for the work item.',
    format: 'uuid',
    example: '01996f1a-2f8b-7b9d-8f5e-1c4a6b7d8e91',
  })
  @IsUUID('7')
  readonly teamId!: string

  @ApiPropertyOptional({
    description: 'Type of the work item.',
    enum: WorkItemType,
    enumName: 'WorkItemType',
    default: WorkItemType.STORY,
  })
  @IsOptional()
  @IsEnum(WorkItemType)
  readonly type?: WorkItemType

  @ApiProperty({
    description: 'Title of the work item.',
    minLength: 1,
    maxLength: 255,
    example: 'Implement user authentication',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  readonly title!: string

  @ApiPropertyOptional({
    description: 'Detailed description of the work item.',
    maxLength: 5000,
    nullable: true,
    example: 'Implement email and OAuth authentication flows.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  readonly description?: string | null

  @ApiPropertyOptional({
    description: 'Acceptance criteria for the work item.',
    type: [String],
    maxItems: 50,
    example: [
      'User can sign in with email and password.',
      'Invalid credentials return a validation error.',
    ],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  readonly acceptanceCriteria?: readonly string[]

  @ApiPropertyOptional({
    description: 'Parent work item identifier.',
    format: 'uuid',
    nullable: true,
    example: '01996f1a-2f8b-7b9d-8f5e-1c4a6b7d8e92',
  })
  @IsOptional()
  @IsUUID('7')
  readonly parentId?: string | null

  @ApiPropertyOptional({
    description: 'Priority of the work item.',
    enum: WorkItemPriority,
    enumName: 'WorkItemPriority',
    nullable: true,
    example: WorkItemPriority.HIGH,
  })
  @IsOptional()
  @IsEnum(WorkItemPriority)
  readonly priority?: WorkItemPriority | null

  @ApiPropertyOptional({
    description: 'Sprint to assign the work item to.',
    format: 'uuid',
    nullable: true,
    example: '01996f1a-2f8b-7b9d-8f5e-1c4a6b7d8e93',
  })
  @IsOptional()
  @IsUUID('7')
  readonly sprintId?: string | null

  @ApiPropertyOptional({
    description: 'User to assign the work item to.',
    format: 'uuid',
    nullable: true,
    example: '01996f1a-2f8b-7b9d-8f5e-1c4a6b7d8e94',
  })
  @IsOptional()
  @IsUUID('7')
  readonly assigneeId?: string | null

  @ApiPropertyOptional({
    description: 'Story point estimate.',
    minimum: 1,
    nullable: true,
    example: 5,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  readonly storyPoints?: number | null

  @ApiPropertyOptional({
    description: 'Date when work on the item started.',
    type: String,
    format: 'date-time',
    nullable: true,
    example: '2026-09-30T09:00:00.000Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  readonly startedAt?: Date | null

  @ApiPropertyOptional({
    description: 'Due date for the work item.',
    type: String,
    format: 'date-time',
    nullable: true,
    example: '2026-10-15T18:00:00.000Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  readonly dueDate?: Date | null
}
