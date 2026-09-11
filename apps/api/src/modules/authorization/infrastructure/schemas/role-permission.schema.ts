import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types, Schema as MongooseSchema } from 'mongoose'

export type RolePermissionDocument = HydratedDocument<RolePermissionModel>

@Schema({
  collection: 'role_permissions',
  timestamps: true,
})
export class RolePermissionModel {
  _id!: Types.ObjectId

  @Prop({
    type: MongooseSchema.Types.UUID,
    required: true,
    unique: true,
    index: true,
  })
  id!: string

  @Prop({
    type: MongooseSchema.Types.UUID,
    required: true,
    index: true,
  })
  roleId!: string

  @Prop({
    type: MongooseSchema.Types.UUID,
    required: true,
    index: true,
  })
  permissionId!: string

  createdAt!: Date
  updatedAt!: Date
}

export const RolePermissionSchema =
  SchemaFactory.createForClass(RolePermissionModel)

RolePermissionSchema.index(
  {
    roleId: 1,
    permissionId: 1,
  },
  {
    unique: true,
    name: 'role_permission_unique',
  }
)
