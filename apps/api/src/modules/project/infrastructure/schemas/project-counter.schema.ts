import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose'

export type ProjectCounterDocument = HydratedDocument<ProjectCounterModel>

@Schema({
  collection: 'project_counters',
  versionKey: false,
})
export class ProjectCounterModel {
  @Prop({
    type: MongooseSchema.Types.UUID,
    required: true,
    immutable: true,
    ref: 'workspaces',
  })
  workspaceId!: string

  @Prop({
    type: Number,
    required: true,
    min: 0,
    default: 0,
  })
  currentNumber!: number

  @Prop({
    type: Date,
    required: true,
    immutable: true,
  })
  createdAt!: Date

  @Prop({
    type: Date,
    required: true,
  })
  updatedAt!: Date
}

export const ProjectCounterSchema =
  SchemaFactory.createForClass(ProjectCounterModel)

ProjectCounterSchema.index(
  {
    workspaceId: 1,
  },
  {
    unique: true,
    name: 'workspace_project_counter_unique',
  }
)
