import { WorkItemListItemOutput } from '../../../../application/contracts/work-item-list-item.output'
import { WorkItemPriority } from '../../../../domain/enums/work-item-priority.enum'
import { WorkItemStatus } from '../../../../domain/enums/work-item-status.enum'
import { WorkItemType } from '../../../../domain/enums/work-item-type.enum'
import { UserSummaryResponseDto } from '@/shared/presentation/dtos/responses/user-summary.response'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class WorkItemResponse implements WorkItemListItemOutput {
  @ApiProperty({
    description: 'Unique work item identifier.',
    format: 'uuid',
    example: '01996f1a-2f8b-7b9d-8f5e-1c4a6b7d8e90',
  })
  readonly id!: string

  @ApiProperty({
    description: 'Human-readable work item key.',
    example: 'ORB-001-001',
  })
  readonly key!: string

  @ApiProperty({
    description: 'Sequential work item number within the project.',
    example: 1,
  })
  readonly number!: number

  @ApiProperty({
    description: 'Type of the work item.',
    enum: WorkItemType,
    enumName: 'WorkItemType',
    example: WorkItemType.STORY,
  })
  readonly type!: WorkItemType

  @ApiProperty({
    description: 'Work item title.',
    example: 'Implement user authentication',
  })
  readonly title!: string

  @ApiPropertyOptional({
    description: 'Detailed work item description.',
    example: 'Implement email and OAuth authentication flows.',
  })
  readonly description?: string

  @ApiProperty({
    description: 'Current workflow status.',
    enum: WorkItemStatus,
    enumName: 'WorkItemStatus',
    example: WorkItemStatus.BACKLOG,
  })
  readonly status!: WorkItemStatus

  @ApiPropertyOptional({
    description: 'Work item priority.',
    enum: WorkItemPriority,
    enumName: 'WorkItemPriority',
    nullable: true,
    example: WorkItemPriority.HIGH,
  })
  readonly priority!: WorkItemPriority | null

  @ApiPropertyOptional({
    description: 'Story point estimate.',
    nullable: true,
    example: 5,
  })
  readonly storyPoints!: number | null

  @ApiPropertyOptional({
    description: 'Current sprint identifier.',
    format: 'uuid',
    nullable: true,
    example: '01996f1a-2f8b-7b9d-8f5e-1c4a6b7d8e91',
  })
  readonly sprintId!: string | null

  @ApiPropertyOptional({
    description: 'Parent work item identifier.',
    format: 'uuid',
    nullable: true,
    example: '01996f1a-2f8b-7b9d-8f5e-1c4a6b7d8e92',
  })
  readonly parentId!: string | null

  @ApiPropertyOptional({
    description: 'Assigned user.',
    type: () => UserSummaryResponseDto,
    nullable: true,
  })
  readonly assignee!: UserSummaryResponseDto | null

  @ApiProperty({
    description: 'User who created the work item.',
    type: () => UserSummaryResponseDto,
  })
  readonly createdBy!: UserSummaryResponseDto

  @ApiPropertyOptional({
    description: 'Date when the work item was started.',
    type: String,
    format: 'date-time',
    nullable: true,
  })
  readonly startedAt!: Date | null

  @ApiPropertyOptional({
    description: 'Work item due date.',
    type: String,
    format: 'date-time',
    nullable: true,
  })
  readonly dueDate!: Date | null

  @ApiPropertyOptional({
    description: 'Date when the work item was completed.',
    type: String,
    format: 'date-time',
    nullable: true,
  })
  readonly completedAt!: Date | null

  @ApiProperty({
    description: 'Date when the work item was created.',
    type: String,
    format: 'date-time',
  })
  readonly createdAt!: Date

  @ApiProperty({
    description: 'Date when the work item was last updated.',
    type: String,
    format: 'date-time',
  })
  readonly updatedAt!: Date
}
