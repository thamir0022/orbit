import { TeamMemberStatus } from '@/modules/team/domain/enums/team-member-status.enum'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose'

export type TeamMemberDocument = HydratedDocument<TeamMemberModel>

@Schema({
  collection: 'team_members',
  timestamps: true,
})
export class TeamMemberModel {
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
    type: MongooseSchema.Types.UUID,
    ref: 'teams',
  })
  teamId!: string

  @Prop({
    required: true,
    type: MongooseSchema.Types.UUID,
    ref: 'users',
  })
  userId!: string

  @Prop({
    required: true,
    enum: TeamMemberStatus,
  })
  status!: TeamMemberStatus

  @Prop({
    required: true,
    type: MongooseSchema.Types.UUID,
    ref: 'users',
  })
  addedBy!: string

  @Prop({
    required: true,
  })
  joinedAt!: Date

  @Prop({
    type: MongooseSchema.Types.UUID,
    ref: 'users',
    default: null,
  })
  removedBy!: string | null

  @Prop({
    type: Date,
    default: null,
  })
  removedAt!: Date | null

  @Prop()
  createdAt!: Date

  @Prop()
  updatedAt!: Date
}

export const TeamMemberSchema = SchemaFactory.createForClass(TeamMemberModel)

/**
 * Prevent the same user from being added to
 * the same team more than once within a workspace.
 */
TeamMemberSchema.index(
  {
    workspaceId: 1,
    teamId: 1,
    userId: 1,
  },
  {
    unique: true,
    name: 'team_member_workspace_team_user_unique',
  }
)

/**
 * Find all members belonging to a team.
 */
TeamMemberSchema.index({
  teamId: 1,
})

/**
 * Find all teams a user belongs to.
 */
TeamMemberSchema.index({
  userId: 1,
})

/**
 * Find a user's memberships inside a workspace.
 *
 * Useful for:
 * - fetching all teams of a user
 * - checking whether a user belongs to a workspace team
 */
TeamMemberSchema.index({
  workspaceId: 1,
  userId: 1,
})

/**
 * Common query:
 * Find active/inactive members of a team
 * within a workspace.
 */
TeamMemberSchema.index({
  workspaceId: 1,
  teamId: 1,
  status: 1,
})
