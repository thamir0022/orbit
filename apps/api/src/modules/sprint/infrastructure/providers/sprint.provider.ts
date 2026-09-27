import { Provider } from '@nestjs/common'

import { SPRINT_REPOSITORY } from '../../application/ports/sprint-repository.port'
import { SPRINT_QUERY_REPOSITORY } from '../../application/ports/sprint-query-repository.port'

import { MongoSprintRepository } from '../persistance/mongoose/repositories/mongo-sprint.repository'
import { MongoSprintQueryRepository } from '../persistance/mongoose/repositories/mongo-sprint-query.repository'

export const sprintProviders: Provider[] = [
  {
    provide: SPRINT_REPOSITORY,
    useClass: MongoSprintRepository,
  },
  {
    provide: SPRINT_QUERY_REPOSITORY,
    useClass: MongoSprintQueryRepository,
  },
]
