import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import {
  WorkItemModel,
  WorkItemSchema,
} from './infrastructure/persistance/mongoose/schemas/work-item.schema'
import { WorkItemProviders } from './infrastructure/providers/work-item.provider'
import {
  WorkItemCounterModel,
  WorkItemCounterSchema,
} from './infrastructure/persistance/mongoose/schemas/work-item-counter.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: WorkItemModel.name,
        schema: WorkItemSchema,
      },
      {
        name: WorkItemCounterModel.name,
        schema: WorkItemCounterSchema,
      },
    ]),
  ],
  providers: [...WorkItemProviders],
})
export class WorkItemModule {}
