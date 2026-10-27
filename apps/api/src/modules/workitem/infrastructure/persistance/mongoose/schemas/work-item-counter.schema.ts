import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose'

export type TeamWorkItemCounterDocument =
  HydratedDocument<TeamWorkItemCounterModel>

@Schema({
  collection: 'team_work_item_counters',
  timestamps: true,
  versionKey: false,
})
export class TeamWorkItemCounterModel {
  @Prop({
    type: MongooseSchema.Types.UUID,
    immutable: true,
    required: true,
  })
  workspaceId!: string

  @Prop({
    type: MongooseSchema.Types.UUID,
    immutable: true,
    required: true,
  })
  teamId!: string

  @Prop({
    type: Number,
    required: true,
    default: 0,
    min: 0,
  })
  lastIssuedNumber!: number
}

export const TeamWorkItemCounterSchema = SchemaFactory.createForClass(
  TeamWorkItemCounterModel
)

TeamWorkItemCounterSchema.index({ workspaceId: 1, teamId: 1 }, { unique: true })
