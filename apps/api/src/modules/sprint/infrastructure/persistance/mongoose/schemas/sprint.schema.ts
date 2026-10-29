import { SprintStatus } from '@/modules/sprint/domain/enums/sprint-status.enum'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose'

export type SprintDocument = HydratedDocument<SprintModel>

@Schema({
  collection: 'sprints',
  timestamps: true,
})
export class SprintModel {
  @Prop({
    required: true,
    unique: true,
    immutable: true,
    type: MongooseSchema.Types.UUID,
  })
  id!: string

  @Prop({
    required: true,
    immutable: true,
    type: MongooseSchema.Types.UUID,
    ref: 'WorkspaceModel',
  })
  workspaceId!: string

  @Prop({
    required: true,
    immutable: true,
    type: MongooseSchema.Types.UUID,
    ref: 'TeamModel',
  })
  teamId!: string

  @Prop({
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 120,
  })
  name!: string

  @Prop({
    type: String,
    trim: true,
    default: null,
    maxlength: 500,
  })
  goal!: string | null

  @Prop({
    type: String,
    trim: true,
    default: null,
    maxlength: 5000,
  })
  description!: string | null

  @Prop({
    required: true,
    type: Date,
  })
  startDate!: Date

  @Prop({
    required: true,
    type: Date,
  })
  endDate!: Date

  @Prop({
    required: true,
    type: String,
    enum: SprintStatus,
    default: SprintStatus.PLANNED,
  })
  status!: SprintStatus

  @Prop({
    required: true,
    immutable: true,
    type: MongooseSchema.Types.UUID,
    ref: 'UserModel',
  })
  createdBy!: string

  @Prop({
    type: Date,
    default: null,
  })
  startedAt!: Date | null

  @Prop({
    type: Date,
    default: null,
  })
  completedAt!: Date | null

  @Prop({
    type: Date,
    default: null,
  })
  cancelledAt!: Date | null

  @Prop({
    type: MongooseSchema.Types.UUID,
    ref: 'UserModel',
    default: null,
  })
  cancelledBy!: string | null

  // Managed automatically by Mongoose's timestamps option.
  createdAt!: Date
  updatedAt!: Date
}

export const SprintSchema = SchemaFactory.createForClass(SprintModel)

// Team Sprint listing: newest first.
SprintSchema.index(
  {
    workspaceId: 1,
    teamId: 1,
    startDate: -1,
    // Match the stable pagination tie-breaker.
    id: 1,
  },
  {
    name: 'workspace_team_start_date_id_idx',
  }
)

// Filter a team's Sprints by status and order them by start date.
SprintSchema.index(
  {
    workspaceId: 1,
    teamId: 1,
    status: 1,
    startDate: -1,
    // Match the stable pagination tie-breaker.
    id: 1,
  },
  {
    name: 'workspace_team_status_start_date_id_idx',
  }
)

// Workspace-wide timeline, if the UI needs this query.
SprintSchema.index(
  {
    workspaceId: 1,
    startDate: -1,
    // Match the stable pagination tie-breaker.
    id: 1,
  },
  {
    name: 'workspace_start_date_id_idx',
  }
)

// Enforce no more than one active Sprint per Team.
SprintSchema.index(
  {
    workspaceId: 1,
    teamId: 1,
  },
  {
    unique: true,
    name: 'workspace_team_one_active_sprint_idx',
    partialFilterExpression: {
      status: SprintStatus.ACTIVE,
    },
  }
)
