import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Schema as MongooseSchema } from 'mongoose'
import { UploadSessionStatus } from '@/modules/file/domain'
import { StorageObjectSubSchema } from './file.schema'

/** Temporary authorization state for a single or multipart upload. */
@Schema({
  collection: 'file_upload_sessions',
  timestamps: false,
  versionKey: false,
  id: false,
  strict: 'throw',
})
export class UploadSessionMongoModel {
  @Prop({ type: MongooseSchema.Types.UUID, required: true, unique: true })
  id!: string

  @Prop({ type: MongooseSchema.Types.UUID, required: true, unique: true })
  fileId!: string

  @Prop({ type: MongooseSchema.Types.UUID, required: true })
  initiatedBy!: string

  @Prop({ type: StorageObjectSubSchema, required: true })
  stagingObject!: { locationId: string; key: string; versionId: string | null }

  @Prop({ type: Number, required: true, min: 1 })
  expectedSizeBytes!: number

  @Prop({
    type: String,
    enum: Object.values(UploadSessionStatus),
    required: true,
  })
  status!: UploadSessionStatus

  @Prop({ type: Date, required: true })
  createdAt!: Date

  @Prop({ type: Date, required: true })
  expiresAt!: Date

  @Prop({ type: Date, default: null })
  completedAt!: Date | null

  @Prop({ type: Date, default: null })
  abortedAt!: Date | null

  @Prop({ type: Number, default: 0, min: 0, required: true })
  revision!: number
}

export const UploadSessionSchema = SchemaFactory.createForClass(
  UploadSessionMongoModel
)
UploadSessionSchema.index({ status: 1, expiresAt: 1 })
