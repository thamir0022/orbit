import { Provider } from '@nestjs/common'
import { WORK_ITEM_REPOSITORY } from '../../application/ports/work-item-repository.port'
import { MongoWorkItemRepository } from '../persistance/mongoose/repositories/mongo-work-item-repository.adaptor'
import { WORK_ITEM_QUERY_REPOSITORY } from '../../application/ports/work-item-query-repository.port'
import { MongoWorkItemQueryRepository } from '../persistance/mongoose/repositories/mongo-work-item-query-repository.adaptor'
import { WORK_ITEM_NUMBER_ALLOCATOR } from '../../application/ports/work-item-number-allocator.port'
import { MongoWorkItemNumberAllocator } from '../persistance/mongoose/repositories/mongoose-work-item-number-allocator.adaptor'

export const WorkItemProviders: Provider[] = [
  {
    provide: WORK_ITEM_REPOSITORY,
    useClass: MongoWorkItemRepository,
  },
  {
    provide: WORK_ITEM_QUERY_REPOSITORY,
    useClass: MongoWorkItemQueryRepository,
  },
  {
    provide: WORK_ITEM_NUMBER_ALLOCATOR,
    useClass: MongoWorkItemNumberAllocator,
  },
]
