import { IBaseRepository } from '@/shared/application'
import { Organization } from '../../domain/entities/organization.entity'
import { OrganizationId } from '../../domain/value-objects'

export interface IOrganizationRepository extends IBaseRepository<
  Organization,
  OrganizationId
> {
  findBySubdomain(subdomain: string): Promise<Organization | null>
}

export const ORGANIZATION_REPOSITORY = Symbol('IOrganizationRepository')
