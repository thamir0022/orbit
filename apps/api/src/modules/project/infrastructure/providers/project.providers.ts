import { Provider } from '@nestjs/common'
import { PROJECT_REPOSITORY } from '../../application/ports/project-repository.port'
import { MongoProjectRepository } from '../persistance/repositories/mongo-project.repository'
import { PROJECT_COUNTER_REPOSITORY } from '../../application/ports/project-counter-repository.port'
import { MongoProjectCounterRepository } from '../persistance/repositories/mongo-project-counter.repository'

export const Projectproviders: Provider[] = [
  {
    provide: PROJECT_REPOSITORY,
    useClass: MongoProjectRepository,
  },
  {
    provide: PROJECT_COUNTER_REPOSITORY,
    useClass: MongoProjectCounterRepository,
  },
]
