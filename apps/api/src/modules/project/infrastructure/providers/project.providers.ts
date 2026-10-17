import { Provider } from '@nestjs/common'
import { PROJECT_REPOSITORY } from '../../application/ports/project-repository.port'
import { MongoProjectRepository } from '../persistance/mongoose/repositories/mongo-project.repository'
import { PROJECT_QUERY_REPOSITORY } from '../../application/ports/project-query-repository.port'
import { MongoProjectQueryRepository } from '../persistance/mongoose/repositories/mongo-project-query.repository'

export const Projectproviders: Provider[] = [
  {
    provide: PROJECT_REPOSITORY,
    useClass: MongoProjectRepository,
  },
  {
    provide: PROJECT_QUERY_REPOSITORY,
    useClass: MongoProjectQueryRepository,
  },
]
