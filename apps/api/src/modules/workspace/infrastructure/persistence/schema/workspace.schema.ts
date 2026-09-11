import { WorkspaceStatus } from '@/modules/workspace/domain'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types, Schema as MongooseSchema } from 'mongoose'
import { CompanySize, CompanyType } from '../../../domain/enums'
/**
 * Workspace Model
 */

export type WorkspaceDocument = HydratedDocument<WorkspaceModel>

class SettingsSchema {
  @Prop({ default: 7 }) defaultPointsPerMemberPerDay!: number
  @Prop({ default: 7 }) defaultHoursPerDay!: number
  @Prop({ default: 5 }) defaultWorkingDaysPerWeek!: number
  @Prop({ default: 10 }) defaultWorkingDaysPerSprint!: number
  @Prop() logoUrl?: string
  @Prop() primaryColor?: string
}

class LocationSchema {
  @Prop() country?: string
  @Prop() state?: string
  @Prop() city?: string
  @Prop() addressLine1?: string
  @Prop() postalCode?: string
}

class VerificationSchema {
  @Prop({ default: 'pending' }) status!: string
  @Prop() method?: string
  @Prop() verifiedAt?: Date
}

class ContactSchema {
  @Prop() phone?: string
  @Prop() email?: string
  @Prop() website?: string
  @Prop() linkedin?: string
  @Prop() twitter?: string
  @Prop() github?: string
}

@Schema({
  collection: 'workspaces',
  timestamps: true,
})
export class WorkspaceModel {
  _id!: Types.ObjectId

  // Domain id (UUID v7)
  @Prop({
    required: true,
    unique: true,
    type: MongooseSchema.Types.UUID,
    index: true,
  })
  id!: string

  @Prop({ required: true })
  name!: string

  // Slug should be unique so we index it
  @Prop({ required: true, unique: true, index: true })
  slug!: string

  // Owner is a reference to a UserId.value (stored as string)
  @Prop({ required: true, index: true })
  ownerId!: string

  // Plan / subscription
  @Prop({ required: true })
  planId!: string

  @Prop()
  subscriptionId?: string

  @Prop()
  trialEndsAt?: Date

  @Prop({ type: SettingsSchema, default: () => ({}) })
  settings!: SettingsSchema

  @Prop({ type: LocationSchema, default: () => ({}) })
  location!: LocationSchema

  @Prop({ type: ContactSchema, default: () => ({}) })
  contactInfo!: ContactSchema

  @Prop({ type: VerificationSchema, default: () => ({}) })
  verification!: VerificationSchema

  // Company meta
  @Prop({ enum: CompanySize })
  companySize?: CompanySize

  @Prop({ enum: CompanyType })
  companyType?: CompanyType

  // Status
  @Prop({
    required: true,
    default: 'active',
    enum: WorkspaceStatus,
    index: true,
  })
  status!: WorkspaceStatus

  // Timestamps (Mongoose handles these automatically because of timestamps: true)
  createdAt!: Date
  updatedAt!: Date

  @Prop()
  deletedAt?: Date
}

export const WorkspaceSchema = SchemaFactory.createForClass(WorkspaceModel)

// Indexes
WorkspaceSchema.index({ slug: 1 }, { unique: true, name: 'slug_idx' })
WorkspaceSchema.index({ ownerId: 1 }, { name: 'owner_idx' })
WorkspaceSchema.index({ createdAt: 1 }, { name: 'created_at_idx' })
WorkspaceSchema.index({ status: 1 }, { name: 'status_idx' })
