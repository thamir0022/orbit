import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose'

export type UserRoleDocument = HydratedDocument<UserRoleModel>

@Schema({ collection: 'user_roles' })
export class UserRoleModel {
  @Prop({ type: MongooseSchema.Types.ObjectId })
  _id!: string

  @Prop({
    required: true,
    unique: true,
    type: MongooseSchema.Types.UUID,
    index: true,
  })
  id!: string

  @Prop({ type: MongooseSchema.Types.UUID })
  userId!: string

  @Prop({ type: MongooseSchema.Types.UUID, ref: 'roles' })
  roleId!: string

  @Prop()
  createdAt!: Date
}

export const UserRoleSchema = SchemaFactory.createForClass(UserRoleModel)

UserRoleSchema.index(
  { userId: 1, roleId: 1 },
  { unique: true, name: 'user_id_role_id_unique' }
)
