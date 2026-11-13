import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Schema as MongooseSchema } from 'mongoose'
import {
  FileMediaType,
  FileScanStatus,
  FileScopeType,
  FileStatus,
} from '@/modules/file/domain'

/** Shared embedded representation of an account/workspace ownership scope. */
export const FileScopeSubSchema = new MongooseSchema(
  {
    type: { type: String, required: true, enum: Object.values(FileScopeType) },
    id: { type: MongooseSchema.Types.UUID, required: true },
  },
  { _id: false, id: false, strict: 'throw' }
)

/** Opaque storage pointer, never an access URL. */
export const StorageObjectSubSchema = new MongooseSchema(
  {
    locationId: { type: String, required: true },
    key: { type: String, required: true },
    versionId: { type: String, default: null },
  },
  { _id: false, id: false, strict: 'throw' }
)

/** Intrinsic media properties extracted from verified bytes. */
const MediaInfoSchema = new MongooseSchema(
  {
    width: { type: Number, default: null },
    height: { type: Number, default: null },
    durationMs: { type: Number, default: null },
  },
  { _id: false, id: false, strict: 'throw' }
)

/** Mongoose record for the independently persisted File aggregate. */
@Schema({
  collection: 'files',
  timestamps: false,
  versionKey: false,
  id: false,
  strict: 'throw',
})
export class FileMongoModel {
  @Prop({ type: MongooseSchema.Types.UUID, required: true, unique: true })
  id!: string

  @Prop({ type: FileScopeSubSchema, required: true })
  scope!: { type: FileScopeType; id: string }

  @Prop({ type: MongooseSchema.Types.UUID, required: true })
  createdBy!: string

  @Prop({ type: String, required: true, maxlength: 255 })
  originalName!: string

  @Prop({ type: String, required: true })
  declaredMimeType!: string

  @Prop({ type: Number, required: true, min: 1 })
  expectedSizeBytes!: number

  @Prop({ type: String, default: null })
  mimeType!: string | null

  @Prop({ type: String, enum: Object.values(FileMediaType), default: null })
  mediaType!: FileMediaType | null

  @Prop({ type: Number, default: null })
  sizeBytes!: number | null

  @Prop({ type: String, default: null })
  checksumSha256!: string | null

  @Prop({ type: MediaInfoSchema, default: null })
  mediaInfo!: {
    width: number | null
    height: number | null
    durationMs: number | null
  } | null

  @Prop({ type: StorageObjectSubSchema, default: null })
  storageObject!: {
    locationId: string
    key: string
    versionId: string | null
  } | null

  @Prop({ type: String, enum: Object.values(FileStatus), required: true })
  status!: FileStatus

  @Prop({ type: String, enum: Object.values(FileScanStatus), required: true })
  scanStatus!: FileScanStatus

  @Prop({ type: String, maxlength: 500, default: null })
  failureReason!: string | null

  @Prop({ type: Date, required: true })
  createdAt!: Date

  @Prop({ type: Date, required: true })
  updatedAt!: Date

  @Prop({ type: Date, default: null })
  uploadedAt!: Date | null

  @Prop({ type: Date, default: null })
  readyAt!: Date | null

  @Prop({ type: Date, default: null })
  deletedAt!: Date | null

  @Prop({ type: Date, default: null })
  purgedAt!: Date | null

  @Prop({ type: Date, default: null })
  purgeAttemptedAt!: Date | null

  @Prop({ type: Number, default: 0, required: true, min: 0 })
  revision!: number
}

export const FileSchema = SchemaFactory.createForClass(FileMongoModel)
FileSchema.index({ 'scope.type': 1, 'scope.id': 1, status: 1, createdAt: -1 })
FileSchema.index({ createdBy: 1, createdAt: -1 })
FileSchema.index({ status: 1, createdAt: 1 })
FileSchema.index({ status: 1, purgedAt: 1, purgeAttemptedAt: 1, deletedAt: 1 })
