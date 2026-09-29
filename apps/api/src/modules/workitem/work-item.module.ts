import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import {
  WorkItemModel,
  WorkItemSchema,
} from './infrastructure/persistance/mongoose/schemas/work-item.schema'
import { WorkItemProviders } from './infrastructure/providers/work-item.provider'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: WorkItemModel.name,
        schema: WorkItemSchema,
      },
    ]),
  ],
  providers: [...WorkItemProviders],
})
export class WorkItemModule {}
