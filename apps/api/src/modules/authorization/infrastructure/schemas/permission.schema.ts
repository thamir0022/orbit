import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose'
import { PermissionStatus } from '../../domain/enums/permission-status.enum'
import { PermissionAction } from '../../domain/enums/permission-action.enum'
import { PermissionResource } from '../../domain/enums/permission-resource.enum'

export type PermissionDocument = HydratedDocument<PermissionModel>

@Schema({
  collection: 'permissions',
  timestamps: true,
})
export class PermissionModel {
  @Prop({
    type: MongooseSchema.Types.UUID,
    required: true,
    unique: true,
    index: true,
  })
  id!: string

  @Prop({
    required: true,
    unique: true,
    index: true,
  })
  key!: string

  @Prop({
    required: true,
    enum: PermissionResource,
  })
  resource!: PermissionResource

  @Prop({
    required: true,
    enum: PermissionAction,
  })
  action!: PermissionAction

  @Prop({
    required: true,
  })
  description!: string

  @Prop({
    required: true,
    default: true,
    index: true,
    enum: PermissionStatus,
  })
  status!: PermissionStatus
  createdAt!: Date
  updatedAt!: Date
}

export const PermissionSchema = SchemaFactory.createForClass(PermissionModel)

PermissionSchema.index(
  {
    resource: 1,
    action: 1,
  },
  {
    unique: true,
    name: 'permission_unique',
  }
)
