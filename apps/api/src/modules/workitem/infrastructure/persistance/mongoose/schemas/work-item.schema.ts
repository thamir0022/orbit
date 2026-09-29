import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Schema as MongooseSchema } from 'mongoose'

import { WorkItemPriority } from '../../../../domain/enums/work-item-priority.enum'
import { WorkItemStatus } from '../../../../domain/enums/work-item-status.enum'
import { WorkItemType } from '../../../../domain/enums/work-item-type.enum'

export type WorkItemDocument = WorkItemSchema & Document

@Schema({
  collection: 'work_items',
  versionKey: false,
})
export class WorkItemSchema {
  @Prop({
    type: MongooseSchema.Types.UUID,
    required: true,
    unique: true,
    immutable: true,
    index: true,
  })
  id!: string

  @Prop({
    type: MongooseSchema.Types.UUID,
    required: true,
    immutable: true,
    ref: 'workspaces',
    index: true,
  })
  workspaceId!: string

  @Prop({
    type: MongooseSchema.Types.UUID,
    required: true,
    immutable: true,
    ref: 'projects',
    index: true,
  })
  projectId!: string

  @Prop({
    type: MongooseSchema.Types.UUID,
    required: true,
    immutable: true,
    ref: 'teams',
    index: true,
  })
  teamId!: string

  @Prop({
    type: String,
    enum: Object.values(WorkItemType),
    required: true,
    default: WorkItemType.STORY,
  })
  type!: WorkItemType

  @Prop({
    type: String,
    required: true,
    immutable: true,
    trim: true,
  })
  key!: string

  @Prop({
    type: Number,
    required: true,
    immutable: true,
    min: 1,
  })
  number!: number

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  title!: string

  @Prop({
    type: String,
    trim: true,
    default: undefined,
  })
  description?: string

  @Prop({
    type: [String],
    default: [],
  })
  acceptanceCriteria!: string[]

  @Prop({
    type: MongooseSchema.Types.UUID,
    ref: 'workitems',
    default: null,
    index: true,
  })
  parentId!: string | null

  @Prop({
    type: String,
    enum: Object.values(WorkItemStatus),
    required: true,
    default: WorkItemStatus.BACKLOG,
  })
  status!: WorkItemStatus

  @Prop({
    type: String,
    enum: Object.values(WorkItemPriority),
    default: null,
  })
  priority!: WorkItemPriority | null

  @Prop({
    type: MongooseSchema.Types.UUID,
    ref: 'sprints',
    default: null,
    index: true,
  })
  sprintId!: string | null

  @Prop({
    type: MongooseSchema.Types.UUID,
    ref: 'users',
    default: null,
    index: true,
  })
  assigneeId!: string | null

  @Prop({
    type: MongooseSchema.Types.UUID,
    required: true,
    immutable: true,
    ref: 'users',
    index: true,
  })
  createdBy!: string

  @Prop({
    type: Number,
    default: null,
    min: 1,
  })
  storyPoints!: number | null

  @Prop({
    type: Date,
    default: null,
  })
  startedAt!: Date | null

  @Prop({
    type: Date,
    default: null,
  })
  dueDate!: Date | null

  @Prop({
    type: Date,
    default: null,
  })
  completedAt!: Date | null

  @Prop({
    type: Date,
    required: true,
    immutable: true,
  })
  createdAt!: Date

  @Prop({
    type: Date,
    required: true,
  })
  updatedAt!: Date

  @Prop({
    type: Date,
    default: null,
    index: true,
  })
  deletedAt!: Date | null
}

export const WorkItemSchemaDefinition =
  SchemaFactory.createForClass(WorkItemSchema)

WorkItemSchemaDefinition.index(
  {
    workspaceId: 1,
    key: 1,
  },
  {
    unique: true,
    name: 'workspace_work_item_key_unique',
  }
)

WorkItemSchemaDefinition.index(
  {
    projectId: 1,
    number: 1,
  },
  {
    unique: true,
    name: 'project_work_item_number_unique',
  }
)

WorkItemSchemaDefinition.index(
  {
    workspaceId: 1,
    projectId: 1,
    status: 1,
  },
  {
    name: 'workspace_project_status_idx',
  }
)

WorkItemSchemaDefinition.index(
  {
    workspaceId: 1,
    teamId: 1,
    status: 1,
  },
  {
    name: 'workspace_team_status_idx',
  }
)

WorkItemSchemaDefinition.index(
  {
    workspaceId: 1,
    teamId: 1,
    sprintId: 1,
  },
  {
    name: 'workspace_team_sprint_idx',
  }
)

WorkItemSchemaDefinition.index(
  {
    workspaceId: 1,
    parentId: 1,
  },
  {
    name: 'workspace_parent_idx',
  }
)

WorkItemSchemaDefinition.index(
  {
    workspaceId: 1,
    assigneeId: 1,
  },
  {
    name: 'workspace_assignee_idx',
  }
)

WorkItemSchemaDefinition.index(
  {
    workspaceId: 1,
    createdAt: -1,
  },
  {
    name: 'workspace_created_at_idx',
  }
)
