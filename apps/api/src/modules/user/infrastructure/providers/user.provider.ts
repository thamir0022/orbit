import { Provider } from '@nestjs/common'
import { USER_REPOSITORY } from '../../application'
import { UserRepository } from '../persistence/repository/user.repository'

export const userProviders: Provider[] = [
  {
    provide: USER_REPOSITORY,
    useClass: UserRepository,
  },
]
