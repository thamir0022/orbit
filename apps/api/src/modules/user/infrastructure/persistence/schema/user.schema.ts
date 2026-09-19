import { type UserPreferencesData } from '@/modules/user/domain'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types, Schema as MongooseSchema } from 'mongoose'

export type UserDocument = HydratedDocument<UserModel>

@Schema({
  collection: 'users',
  timestamps: true,
})
export class UserModel {
  _id!: Types.ObjectId

  @Prop({
    required: true,
    unique: true,
    type: MongooseSchema.Types.UUID,
    index: true,
  })
  id!: string // UUID v7

  @Prop({ required: true })
  firstName!: string

  @Prop({ required: true })
  lastName!: string

  @Prop({ required: true })
  displayName!: string

  @Prop({ required: true, unique: true, lowercase: true, index: true })
  email!: string

  @Prop()
  passwordHash!: string

  @Prop({ default: false })
  hasPassword!: boolean

  @Prop()
  passwordUpdatedAt?: Date

  @Prop()
  avatarUrl!: string

  // Authentication
  @Prop({ required: true, default: false })
  emailVerified!: boolean

  // MFA
  @Prop({ required: true, default: false })
  mfaEnabled!: boolean

  @Prop({ type: [String], default: [] })
  mfaBackupCodes!: string[]

  // Rate Limiting
  @Prop({ default: 0 })
  loginAttempts!: number

  @Prop()
  lockedUntil?: Date

  // OAuth
  @Prop({ default: 'email', index: true })
  authProvider!: string

  @Prop({ sparse: true })
  oauthProviderId!: string

  // Status
  @Prop({ required: true, default: 'active', index: true })
  status!: string

  @Prop()
  lastLoginAt!: Date

  // Preferences
  @Prop({ type: Object })
  preferences!: UserPreferencesData

  @Prop({ default: 'UTC' })
  timezone!: string

  @Prop({ default: 'en-IN' })
  locale!: string

  // Timestamps (managed by Mongoose)
  createdAt!: Date
  updatedAt!: Date

  @Prop()
  deletedAt!: Date
}

export const UserSchema = SchemaFactory.createForClass(UserModel)

// Compound index
UserSchema.index({ email: 1, status: 1 }, { name: 'email_status_idx' })
UserSchema.index({ createdAt: 1 })
