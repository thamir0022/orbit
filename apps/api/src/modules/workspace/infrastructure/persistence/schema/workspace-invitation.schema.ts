import { WorkspaceInvitationStatus } from '@/modules/workspace/domain'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose'

export type WorkspaceInvitationDocument =
  HydratedDocument<WorkspaceInvitationModel>

@Schema({
  collection: 'workspace_invitations',
  timestamps: true,
  versionKey: false,
})
export class WorkspaceInvitationModel {
  @Prop({
    required: true,
    type: MongooseSchema.Types.UUID,
  })
  id!: string

  @Prop({
    required: true,
    type: MongooseSchema.Types.UUID,
    ref: 'workspaces',
    index: true,
  })
  workspaceId!: string

  @Prop({
    required: true,
    lowercase: true,
    trim: true,
  })
  email!: string

  @Prop({
    required: true,
    type: MongooseSchema.Types.UUID,
    ref: 'roles',
  })
  roleId!: string

  @Prop({
    required: true,
    type: MongooseSchema.Types.UUID,
    ref: 'users',
  })
  invitedBy!: string

  @Prop({
    required: true,
    enum: WorkspaceInvitationStatus,
    index: true,
  })
  status!: WorkspaceInvitationStatus

  @Prop({
    required: true,
    maxlength: 128,
    index: true,
  })
  tokenHash!: string

  @Prop({
    required: true,
    index: true,
  })
  expiresAt!: Date

  @Prop({
    default: null,
    type: Date,
  })
  acceptedAt!: Date | null

  @Prop({
    required: true,
  })
  createdAt!: Date

  @Prop({
    required: true,
  })
  updatedAt!: Date
}

export const WorkspaceInvitationSchema = SchemaFactory.createForClass(
  WorkspaceInvitationModel
)

WorkspaceInvitationSchema.index(
  {
    workspaceId: 1,
    email: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      status: WorkspaceInvitationStatus.PENDING,
    },
    name: 'workspace_pending_invitation_idx',
  }
)
