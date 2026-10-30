import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Schema as MongooseSchema } from 'mongoose'
import { SprintItemSnapshot } from '../../../../domain/interfaces/sprint-snapshot.interface'
import { SprintAssignmentState } from '../../../../domain/enums/sprint-assignment-state.enum'

export const SPRINT_WORK_ITEM_MODEL = 'SprintWorkItem'

/** Stores immutable assignment identity and sprint membership history. */
@Schema({ collection: 'sprint_work_items', timestamps: true })
export class SprintWorkItemModel {
  @Prop({
    type: MongooseSchema.Types.UUID,
    required: true,
    unique: true,
  })
  id!: string

  @Prop({
    type: MongooseSchema.Types.UUID,
    required: true,
    immutable: true,
  })
  workspaceId!: string

  @Prop({
    type: MongooseSchema.Types.UUID,
    required: true,
    immutable: true,
  })
  teamId!: string

  @Prop({
    type: MongooseSchema.Types.UUID,
    required: true,
    immutable: true,
  })
  sprintId!: string

  @Prop({
    type: MongooseSchema.Types.UUID,
    required: true,
    immutable: true,
  })
  workItemId!: string

  @Prop({
    type: String,
    required: true,
    enum: SprintAssignmentState,
  })
  state!: SprintAssignmentState

  @Prop({
    type: Boolean,
    required: true,
  })
  current!: boolean

  @Prop({
    type: Date,
    required: true,
  })
  addedAt!: Date

  @Prop({
    type: MongooseSchema.Types.UUID,
    required: true,
  })
  addedBy!: string

  @Prop({
    type: Boolean,
    required: true,
  })
  addedDuringActive!: boolean

  @Prop({
    type: Date,
    default: null,
  })
  removedAt!: Date | null

  @Prop({
    type: MongooseSchema.Types.UUID,
    default: null,
  })
  removedBy!: string | null

  @Prop({
    type: String,
    maxlength: 1000,
    default: null,
  })
  reason!: string | null

  @Prop({
    type: String,
    maxlength: 1000,
    default: null,
  })
  assignmentReason!: string | null

  @Prop({
    type: MongooseSchema.Types.UUID,
    default: null,
  })
  sourceSprintId!: string | null

  @Prop({
    type: MongooseSchema.Types.UUID,
    default: null,
  })
  targetSprintId!: string | null

  @Prop({
    type: MongooseSchema.Types.UUID,
    default: null,
  })
  previousAssignmentId!: string | null

  @Prop({
    type: Number,
    required: true,
    min: 0,
  })
  rolloverCount!: number

  @Prop({
    type: MongooseSchema.Types.Mixed,
    required: true,
  })
  assignedSnapshot!: SprintItemSnapshot

  @Prop({
    type: MongooseSchema.Types.Mixed,
    default: null,
  })
  committedSnapshot!: SprintItemSnapshot | null

  @Prop({
    type: MongooseSchema.Types.Mixed,
    default: null,
  })
  closedSnapshot!: SprintItemSnapshot | null
}
export const SprintWorkItemSchema =
  SchemaFactory.createForClass(SprintWorkItemModel)

// A work item can have only one current assignment across planned and active sprints.
SprintWorkItemSchema.index(
  { workspaceId: 1, workItemId: 1 },
  {
    unique: true,
    partialFilterExpression: { current: true },
    name: 'one_current_sprint_per_item',
  }
)
SprintWorkItemSchema.index({
  workspaceId: 1,
  teamId: 1,
  sprintId: 1,
  addedAt: 1,
  id: 1,
})
SprintWorkItemSchema.index({
  workspaceId: 1,
  workItemId: 1,
  addedAt: -1,
  id: -1,
})
