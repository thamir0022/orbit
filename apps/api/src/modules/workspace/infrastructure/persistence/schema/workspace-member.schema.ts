import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Schema as MongooseSchema } from 'mongoose'
import { WorkspaceMemberStatus } from '@/modules/workspace/domain/enums/workspace-member-status.enum'

export type WorkspaceMemberDocument = WorkspaceMemberModel & Document

@Schema({
  collection: 'workspace_members',
  timestamps: true,
  versionKey: false,
})
export class WorkspaceMemberModel {
  @Prop({ type: MongooseSchema.Types.UUID, unique: true, required: true })
  id!: string

  @Prop({ type: MongooseSchema.Types.UUID, required: true, index: true })
  workspaceId!: string

  @Prop({ type: MongooseSchema.Types.UUID, required: true, index: true })
  userId!: string

  @Prop({ type: MongooseSchema.Types.UUID, required: true, index: true })
  roleId!: string

  @Prop({
    type: String,
    enum: WorkspaceMemberStatus,
    default: WorkspaceMemberStatus.ACTIVE,
    index: true,
  })
  status!: string

  @Prop({ type: MongooseSchema.Types.UUID, required: false, default: null })
  invitedBy!: string | null

  @Prop({ type: Date, required: false, default: null })
  invitedAt!: Date | null

  @Prop({ type: Date, required: false, default: null })
  joinedAt!: Date | null

  // createdAt and updatedAt are handled by Mongoose timestamps: true
  createdAt!: Date
  updatedAt!: Date
}

export const WorkspaceMemberSchema =
  SchemaFactory.createForClass(WorkspaceMemberModel)

// Compound unique index from DBML: (workspaceId, userId) [unique]
WorkspaceMemberSchema.index(
  { workspaceId: 1, userId: 1 },
  { unique: true, name: 'org_user_unique' }
)
