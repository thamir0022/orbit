import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { OrganizationMemberStatus } from '@/modules/organization/domain/enums/organization-member-status.enum'

export type OrganizationMemberDocument = OrganizationMemberModel & Document

@Schema({
  collection: 'organizationMembers',
  timestamps: true,
  versionKey: false,
})
export class OrganizationMemberModel {
  @Prop({ type: String, unique: true, required: true })
  id: string

  @Prop({ type: String, required: true, index: true })
  organizationId: string

  @Prop({ type: String, required: true, index: true })
  userId: string

  @Prop({ type: String, required: true, index: true })
  roleId: string

  @Prop({
    type: String,
    enum: OrganizationMemberStatus,
    default: OrganizationMemberStatus.ACTIVE,
    index: true,
  })
  status: string

  @Prop({ type: String, required: false, default: null })
  invitedBy: string | null

  @Prop({ type: Date, required: false, default: null })
  invitedAt: Date | null

  @Prop({ type: Date, required: false, default: null })
  joinedAt: Date | null

  // createdAt and updatedAt are handled by Mongoose timestamps: true
  createdAt: Date
  updatedAt: Date
}

export const OrganizationMemberSchema = SchemaFactory.createForClass(
  OrganizationMemberModel
)

// Compound unique index from DBML: (organizationId, userId) [unique]
OrganizationMemberSchema.index(
  { organizationId: 1, userId: 1 },
  { unique: true, name: 'org_user_unique' }
)
