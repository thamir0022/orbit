import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Schema as MongooseSchema } from 'mongoose'
import { FileScopeType } from '@/modules/file/domain'
import { FileScopeSubSchema } from './file.schema'

/** Quota counters for a single user or tenant scope. */
@Schema({
  collection: 'file_storage_usage',
  timestamps: false,
  versionKey: false,
  id: false,
  strict: 'throw',
})
export class StorageUsageMongoModel {
  @Prop({ type: MongooseSchema.Types.UUID, required: true, unique: true })
  id!: string

  @Prop({ type: FileScopeSubSchema, required: true })
  scope!: { type: FileScopeType; id: string }

  @Prop({ type: Number, required: true, min: 0 })
  usedBytes!: number

  @Prop({ type: Number, required: true, min: 0 })
  reservedBytes!: number

  @Prop({ type: Date, required: true })
  updatedAt!: Date

  @Prop({ type: Number, default: 0, min: 0, required: true })
  revision!: number
}

export const StorageUsageSchema = SchemaFactory.createForClass(
  StorageUsageMongoModel
)
StorageUsageSchema.index({ 'scope.type': 1, 'scope.id': 1 }, { unique: true })
