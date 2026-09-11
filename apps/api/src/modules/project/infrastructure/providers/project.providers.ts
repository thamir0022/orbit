import { Provider } from '@nestjs/common'
import { PROJECT_REPOSITORY } from '../../application/repositories/project.repository.interface'
import { MongoProjectRepository } from '../repositories/mongo-project.repository'

export const Projectproviders: Provider[] = [
  { provide: PROJECT_REPOSITORY, useClass: MongoProjectRepository },
]
