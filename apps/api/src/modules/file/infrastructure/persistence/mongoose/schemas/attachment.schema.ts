import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Schema as MongooseSchema } from 'mongoose'
import {
  AttachmentPlacement,
  AttachmentTargetType,
} from '@/modules/file/domain'

const TargetSubSchema = new MongooseSchema(
  {
    type: {
      type: String,
      enum: Object.values(AttachmentTargetType),
      required: true,
    },
    id: { type: MongooseSchema.Types.UUID, required: true },
  },
  { _id: false, id: false, strict: 'throw' }
)

/** A workspace-scoped link between a file and one business entity. */
@Schema({
  collection: 'attachments',
  timestamps: false,
  versionKey: false,
  id: false,
  strict: 'throw',
})
export class AttachmentMongoModel {
  @Prop({ type: MongooseSchema.Types.UUID, required: true, unique: true })
  id!: string

  @Prop({ type: MongooseSchema.Types.UUID, required: true })
  workspaceId!: string

  @Prop({ type: MongooseSchema.Types.UUID, required: true })
  fileId!: string

  @Prop({ type: TargetSubSchema, required: true })
  target!: { type: AttachmentTargetType; id: string }

  @Prop({
    type: String,
    enum: Object.values(AttachmentPlacement),
    required: true,
  })
  placement!: AttachmentPlacement

  @Prop({ type: String, default: null, maxlength: 255 })
  displayName!: string | null

  @Prop({ type: Number, required: true, min: 0 })
  position!: number

  @Prop({ type: MongooseSchema.Types.UUID, required: true })
  createdBy!: string

  @Prop({ type: Date, required: true })
  createdAt!: Date

  @Prop({ type: Date, required: true })
  updatedAt!: Date

  @Prop({ type: Date, default: null })
  deletedAt!: Date | null

  @Prop({ type: Number, default: 0, min: 0, required: true })
  revision!: number
}

export const AttachmentSchema =
  SchemaFactory.createForClass(AttachmentMongoModel)
AttachmentSchema.index({
  workspaceId: 1,
  'target.type': 1,
  'target.id': 1,
  deletedAt: 1,
  position: 1,
})
AttachmentSchema.index({ fileId: 1, deletedAt: 1 })
AttachmentSchema.index(
  { workspaceId: 1, fileId: 1, 'target.type': 1, 'target.id': 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } }
)
