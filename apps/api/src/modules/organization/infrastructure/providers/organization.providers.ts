import { Provider } from '@nestjs/common'
import { ORGANIZATION_REPOSITORY } from '../../application'
import { OrganizationRepository } from '../persistence/repository/organization.repository'

export const organizationProviders: Provider[] = [
  {
    provide: ORGANIZATION_REPOSITORY,
    useClass: OrganizationRepository,
  },
]
