import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose'

export type WorkItemCounterDocument = HydratedDocument<WorkItemCounterModel>

@Schema({
  collection: 'work_item_counters',
  versionKey: false,
})
export class WorkItemCounterModel {
  @Prop({
    type: MongooseSchema.Types.UUID,
    required: true,
    immutable: true,
    ref: 'projects',
  })
  projectId!: string

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

export const WorkItemCounterSchema =
  SchemaFactory.createForClass(WorkItemCounterModel)

WorkItemCounterSchema.index(
  {
    projectId: 1,
  },
  {
    unique: true,
    name: 'project_work_item_counter_unique',
  }
)
