import { Provider } from '@nestjs/common'
import {
  ORGANIZATION_MEMBER_REPOSITORY,
  ORGANIZATION_REPOSITORY,
} from '../../application'
import { OrganizationRepository } from '../persistence/repository/organization.repository'
import { OrganizationMemberRepository } from '../persistence/repository/organization-member.repository'

export const organizationProviders: Provider[] = [
  {
    provide: ORGANIZATION_REPOSITORY,
    useClass: OrganizationRepository,
  },
  {
    provide: ORGANIZATION_MEMBER_REPOSITORY,
    useClass: OrganizationMemberRepository,
  },
]
