import { DocumentContent } from '@/modules/document/domain/interfaces/document.interface'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose'

export type DocumentDocument = HydratedDocument<DocumentModel>

/**
 * MongoDB persistence model for workspace documents.
 *
 * Stores the Tiptap document state as JSON while keeping ownership,
 * auditing, and soft-delete metadata queryable.
 */
@Schema({
  collection: 'documents',
  versionKey: false,
  timestamps: true,
})
export class DocumentModel {
  @Prop()
  _id!: MongooseSchema.Types.ObjectId

  @Prop({
    required: true,
    unique: true,
    immutable: true,
    type: MongooseSchema.Types.UUID,
  })
  id!: string

  @Prop({
    required: true,
    type: MongooseSchema.Types.UUID,
    ref: 'workspaces',
  })
  workspaceId!: string

  @Prop({
    required: true,
    type: MongooseSchema.Types.UUID,
    ref: 'users',
  })
  ownerId!: string

  @Prop({
    required: true,
    trim: true,
    default: 'Untitled',
  })
  title!: string

  @Prop({
    required: true,
    type: MongooseSchema.Types.Mixed,
  })
  content!: DocumentContent

  @Prop({
    required: true,
    type: MongooseSchema.Types.UUID,
    ref: 'users',
  })
  createdBy!: string

  @Prop({
    required: true,
    type: MongooseSchema.Types.UUID,
    ref: 'users',
  })
  updatedBy!: string

  @Prop({
    type: Date,
    default: null,
  })
  deletedAt!: Date | null

  @Prop({
    type: MongooseSchema.Types.UUID,
    ref: 'users',
    default: null,
  })
  deletedBy!: string | null

  @Prop()
  createdAt!: Date

  @Prop()
  updatedAt!: Date
}

export const DocumentSchema = SchemaFactory.createForClass(DocumentModel)

/**
 * Primary workspace query index.
 *
 * Supports retrieving active documents within a workspace,
 * ordered by most recently created.
 */
DocumentSchema.index({
  workspaceId: 1,
  deletedAt: 1,
  createdAt: -1,
})

/**
 * Owner-scoped document query index.
 *
 * Supports retrieving a user's active personal documents within
 * a workspace, ordered by most recently created.
 */
DocumentSchema.index({
  workspaceId: 1,
  ownerId: 1,
  deletedAt: 1,
  createdAt: -1,
})
