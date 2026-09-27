import { SprintStatus } from '@/modules/sprint/domain/enums/sprint-status.enum'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose'

export type SprintDocument = HydratedDocument<SprintModel>

@Schema({
  collection: 'sprints',
  timestamps: true,
})
export class SprintModel {
  @Prop()
  _id!: MongooseSchema.Types.ObjectId

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
    ref: 'workspaces',
  })
  workspaceId!: string

  @Prop({
    required: true,
    immutable: true,
    type: MongooseSchema.Types.UUID,
    ref: 'teams',
  })
  teamId!: string

  // Sprint details
  @Prop({
    required: true,
    trim: true,
  })
  name!: string

  @Prop({
    trim: true,
  })
  goal?: string

  @Prop({
    trim: true,
  })
  description?: string

  // Timebox
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

  // Lifecycle
  @Prop({
    required: true,
    enum: SprintStatus,
    default: SprintStatus.PLANNED,
  })
  status!: SprintStatus

  // Planning snapshots
  @Prop({
    type: Number,
    default: null,
    min: 0,
  })
  committedPoints!: number | null

  @Prop({
    type: Number,
    default: null,
    min: 0,
  })
  completedPoints!: number | null

  // Audit
  @Prop({
    required: true,
    immutable: true,
    type: MongooseSchema.Types.UUID,
    ref: 'users',
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
    ref: 'users',
    default: null,
  })
  cancelledBy!: string | null

  // Managed automatically by Mongoose timestamps.
  @Prop()
  createdAt!: Date

  @Prop()
  updatedAt!: Date
}

export const SprintSchema = SchemaFactory.createForClass(SprintModel)

/**
 * Primary tenant + team query.
 *
 * Example:
 * { workspaceId, teamId }
 *
 * Used for retrieving all sprints belonging to a team.
 */
SprintSchema.index({
  workspaceId: 1,
  teamId: 1,
})

/**
 * Common team + status filtering.
 *
 * Example:
 * { workspaceId, teamId, status }
 *
 * Useful for:
 * - active sprint lookup
 * - planned sprint filtering
 * - completed sprint filtering
 */
SprintSchema.index(
  {
    workspaceId: 1,
    teamId: 1,
    status: 1,
  },
  {
    name: 'workspace_team_status_idx',
  }
)

/**
 * Team sprint ordering and time-based filtering.
 *
 * Useful for:
 * - sorting sprints by start date
 * - date-range queries
 * - retrieving the current/next sprint
 */
SprintSchema.index(
  {
    workspaceId: 1,
    teamId: 1,
    startDate: 1,
  },
  {
    name: 'workspace_team_start_date_idx',
  }
)

/**
 * Workspace-wide sprint time queries.
 *
 * Useful for:
 * - workspace-level reporting
 * - calendar/timeline queries
 * - date-based sprint filtering across teams
 */
SprintSchema.index(
  {
    workspaceId: 1,
    startDate: 1,
  },
  {
    name: 'workspace_start_date_idx',
  }
)

/**
 * Useful for retrieving recent sprints for a team.
 *
 * The index supports descending start-date queries commonly
 * used by sprint history and current-sprint screens.
 */
SprintSchema.index(
  {
    workspaceId: 1,
    teamId: 1,
    startDate: -1,
  },
  {
    name: 'workspace_team_recent_sprints_idx',
  }
)
