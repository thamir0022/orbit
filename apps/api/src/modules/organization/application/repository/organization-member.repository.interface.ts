import { IBaseRepository } from '@/shared/application'
import { OrganizationMember } from '../../domain/entities/organization-member.entity'

export interface IOrganizationMemberRepository extends IBaseRepository<
  OrganizationMember,
  string
> {
  findByOrganizationAndUserId(
    organizationId: string,
    userId: string
  ): Promise<OrganizationMember | null>
}

export const ORGANIZATION_MEMBER_REPOSITORY = Symbol(
  'ORGANIZATION_MEMBER_REPOSITORY'
)
