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
import { WorkItemController } from './presentation/http/controllers/work-item.controller'
import { ProjectModule } from '../project/project.module'
import {
  CREATE_WORK_ITEM_USE_CASE,
  CreateWorkItemUseCase,
} from './application/usecases/create-work-item'
import {
  GET_WORK_ITEMS_USE_CASE,
  GetWorkItemsUseCase,
} from './application/usecases/get-workitems'
import {
  GET_WORK_ITEM_USE_CASE,
  GetWorkItemUseCase,
} from './application/usecases/get-workitem'
import {
  DELETE_WORK_ITEM_USE_CASE,
  DeleteWorkItemUseCase,
} from './application/usecases/delete-workitem'

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
    ProjectModule,
  ],
  providers: [
    ...WorkItemProviders,
    {
      provide: CREATE_WORK_ITEM_USE_CASE,
      useClass: CreateWorkItemUseCase,
    },
    {
      provide: GET_WORK_ITEMS_USE_CASE,
      useClass: GetWorkItemsUseCase,
    },
    {
      provide: GET_WORK_ITEM_USE_CASE,
      useClass: GetWorkItemUseCase,
    },
    {
      provide: DELETE_WORK_ITEM_USE_CASE,
      useClass: DeleteWorkItemUseCase,
    },
  ],
  controllers: [WorkItemController],
})
export class WorkItemModule {}
