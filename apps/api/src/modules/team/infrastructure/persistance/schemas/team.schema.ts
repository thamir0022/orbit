import { TeamStatus } from '@/modules/team/domain/enums/team-status.enum'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose'

export type TeamDocument = HydratedDocument<TeamModel>

@Schema({
  collection: 'teams',
  timestamps: true,
})
export class TeamModel {
  @Prop()
  _id!: MongooseSchema.Types.ObjectId

  @Prop({
    required: true,
    unique: true,
    type: MongooseSchema.Types.UUID,
  })
  id!: string

  @Prop({
    required: true,
    type: MongooseSchema.Types.UUID,
    ref: 'workspaces',
  })
  workspaceId!: string

  @Prop({
    required: true,
    trim: true,
  })
  name!: string

  @Prop({
    trim: true,
  })
  description?: string

  @Prop({
    trim: true,
  })
  avatarUrl?: string

  @Prop({
    type: MongooseSchema.Types.UUID,
    ref: 'users',
    default: null,
  })
  leadId!: string | null

  @Prop({
    required: true,
    enum: TeamStatus,
  })
  status!: TeamStatus

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

  @Prop({
    required: true,
    type: MongooseSchema.Types.UUID,
    ref: 'users',
  })
  createdBy!: string

  @Prop()
  createdAt!: Date

  @Prop()
  updatedAt!: Date
}

export const TeamSchema = SchemaFactory.createForClass(TeamModel)

/**
 * Primary tenant query:
 * Find all teams belonging to a workspace.
 */
TeamSchema.index({
  workspaceId: 1,
})

/**
 * Common workspace + status filtering.
 *
 * Example:
 * { workspaceId, status }
 */
TeamSchema.index({
  workspaceId: 1,
  status: 1,
})

/**
 * Workspace + team name lookup.
 *
 * Useful for:
 * - prevent duplicate team names within the same workspace.
 * - finding a specific team by name
 * - workspace-scoped team search
 */
TeamSchema.index(
  {
    workspaceId: 1,
    name: 1,
  },
  {
    unique: true,
    name: 'workspace_team_name_unique',
  }
)

/**
 * Find teams led by a particular user inside a workspace.
 */
TeamSchema.index({
  workspaceId: 1,
  leadId: 1,
})
