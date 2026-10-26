import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose'

import { WorkItemPriority } from '../../../../domain/enums/work-item-priority.enum'
import { WorkItemStatus } from '../../../../domain/enums/work-item-status.enum'
import { WorkItemType } from '../../../../domain/enums/work-item-type.enum'

export type WorkItemDocument = HydratedDocument<WorkItemModel>

@Schema({
  collection: 'work_items',
  timestamps: true,
  versionKey: false,
})
export class WorkItemModel {
  @Prop({
    type: MongooseSchema.Types.UUID,
    required: true,
    unique: true,
    immutable: true,
  })
  id!: string

  @Prop({
    type: MongooseSchema.Types.UUID,
    required: true,
    immutable: true,
    ref: 'workspaces',
  })
  workspaceId!: string

  @Prop({
    type: MongooseSchema.Types.UUID,
    default: null,
    ref: 'projects',
  })
  projectId!: string | null

  @Prop({
    type: MongooseSchema.Types.UUID,
    required: true,
    immutable: true,
    ref: 'teams',
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
    minlength: 1,
    maxlength: 250,
  })
  key!: string

  @Prop({
    type: Number,
    required: true,
    immutable: true,
    min: 1,
    validate: {
      validator: Number.isInteger,
      message: 'Work Item number must be an integer.',
    },
  })
  number!: number

  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 250,
  })
  title!: string

  @Prop({
    type: String,
    trim: true,
    maxlength: 20000,
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
    ref: 'users',
    default: null,
  })
  assigneeId!: string | null

  @Prop({
    type: MongooseSchema.Types.UUID,
    required: true,
    immutable: true,
    ref: 'users',
  })
  createdBy!: string

  @Prop({
    type: Number,
    default: null,
    min: 1,
    validate: {
      validator: (value: number | null) =>
        value == null ||
        (Number.isFinite(value) && Number.isInteger(value) && value >= 1),
      message: 'Story points must be a positive integer.',
    },
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
    default: null,
  })
  deletedAt!: Date | null

  @Prop({
    type: MongooseSchema.Types.UUID,
    ref: 'users',
    default: null,
  })
  deletedBy!: string | null

  // Managed automatically by Mongoose's timestamps option.
  createdAt!: Date
  updatedAt!: Date
}

export const WorkItemSchema = SchemaFactory.createForClass(WorkItemModel)

// ---------------------------------------------------------------------------
// Unique constraints
// ---------------------------------------------------------------------------

// Work Item keys are unique within a workspace.
WorkItemSchema.index(
  {
    workspaceId: 1,
    key: 1,
  },
  {
    unique: true,
    name: 'workspace_work_item_key_unique',
  }
)

// Work Item numbers are scoped to their owning Team.
WorkItemSchema.index(
  {
    workspaceId: 1,
    teamId: 1,
    number: 1,
  },
  {
    unique: true,
    name: 'workspace_team_work_item_number_unique',
  }
)

// ---------------------------------------------------------------------------
// Query indexes
// ---------------------------------------------------------------------------

WorkItemSchema.index(
  {
    workspaceId: 1,
    projectId: 1,
    status: 1,
  },
  {
    name: 'workspace_project_status_idx',
  }
)

WorkItemSchema.index(
  {
    workspaceId: 1,
    teamId: 1,
    status: 1,
  },
  {
    name: 'workspace_team_status_idx',
  }
)

WorkItemSchema.index(
  {
    workspaceId: 1,
    parentId: 1,
  },
  {
    name: 'workspace_parent_idx',
  }
)

WorkItemSchema.index(
  {
    workspaceId: 1,
    assigneeId: 1,
  },
  {
    name: 'workspace_assignee_idx',
  }
)

WorkItemSchema.index(
  {
    workspaceId: 1,
    createdAt: -1,
  },
  {
    name: 'workspace_created_at_idx',
  }
)
