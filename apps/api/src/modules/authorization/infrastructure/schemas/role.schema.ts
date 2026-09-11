import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose'
import { RoleScope } from '../../domain/enums/role-scope.enum'

export type RoleDocument = HydratedDocument<RoleModel>

@Schema({
  collection: 'roles',
  timestamps: true,
})
export class RoleModel {
  @Prop({
    required: true,
    unique: true,
    type: MongooseSchema.Types.UUID,
    index: true,
  })
  id!: string

  @Prop({
    required: true,
    index: true,
  })
  workspaceId!: string

  @Prop({
    required: true,
  })
  name!: string

  @Prop()
  description?: string

  @Prop({
    required: true,
    enum: RoleScope,
  })
  scope!: RoleScope

  @Prop({
    required: true,
    default: false,
    index: true,
  })
  isPredefined!: boolean

  @Prop({
    required: true,
    default: 'active',
    index: true,
  })
  status!: string

  @Prop({
    required: true,
  })
  createdBy!: string

  createdAt!: Date
  updatedAt!: Date
  deletedAt!: Date
}

export const RoleSchema = SchemaFactory.createForClass(RoleModel)

RoleSchema.index(
  { workspaceId: 1, name: 1 },
  {
    unique: true,
    name: 'workspace_role_name_unique',
  }
)

RoleSchema.index(
  {
    workspaceId: 1,
    status: 1,
  },
  { name: 'workspace_status_idx' }
)
