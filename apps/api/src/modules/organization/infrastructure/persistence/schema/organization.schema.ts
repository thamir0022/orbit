import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import type { HydratedDocument, Types } from 'mongoose'

/**
 * Organization Model
 */

export type OrganizationDocument = HydratedDocument<OrganizationModel>

class SettingsSchema {
  @Prop({ default: 7 }) defaultPointsPerMemberPerDay: number
  @Prop({ default: 7 }) defaultHoursPerDay: number
  @Prop({ default: 5 }) defaultWorkingDaysPerWeek: number
  @Prop({ default: 10 }) defaultWorkingDaysPerSprint: number
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
  @Prop({ default: 'pending' }) status: string
  @Prop() method?: string
  @Prop() verifiedAt?: Date
}

class ContactSchema {
  @Prop()
  phone?: string

  @Prop()
  email?: string

  @Prop()
  website?: string

  @Prop()
  linkedin?: string

  @Prop()
  twitter?: string

  @Prop()
  github?: string
}

@Schema({
  collection: 'organizations',
  timestamps: true,
})
export class OrganizationModel {
  _id: Types.ObjectId

  // Domain id (UUID v7)
  @Prop({ required: true, unique: true, index: true })
  id: string

  @Prop({ required: true })
  name: string

  // Subdomain should be unique so we index it
  @Prop({ required: true, unique: true, index: true })
  subdomain: string

  // Owner is a reference to a UserId.value (stored as string)
  @Prop({ required: true, index: true })
  ownerId: string

  // Plan / subscription
  @Prop({ required: true })
  planId: string

  @Prop()
  subscriptionId?: string

  @Prop()
  trialEndsAt?: Date

  @Prop({ type: SettingsSchema, default: () => ({}) })
  settings: SettingsSchema

  @Prop({ type: LocationSchema, default: () => ({}) })
  location: LocationSchema

  @Prop({ type: ContactSchema, default: () => ({}) })
  contactInfo: ContactSchema

  @Prop({ type: VerificationSchema, default: () => ({}) })
  verification: VerificationSchema

  // Company meta
  @Prop()
  companySize?: string

  @Prop()
  companyType?: string

  // Status
  @Prop({ required: true, default: 'active', index: true })
  status: string

  // Timestamps
  createdAt: Date
  updatedAt: Date

  @Prop()
  deletedAt?: Date
}

export const OrganizationSchema =
  SchemaFactory.createForClass(OrganizationModel)

// Indexes
OrganizationSchema.index(
  { subdomain: 1 },
  { unique: true, name: 'subdomain_idx' }
)
OrganizationSchema.index({ ownerId: 1 }, { name: 'owner_idx' })
OrganizationSchema.index({ createdAt: 1 }, { name: 'created_at_idx' })
OrganizationSchema.index({ status: 1 }, { name: 'status_idx' })
