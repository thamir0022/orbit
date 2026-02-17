import { CompanySize, CompanyType } from '../../domain'

export interface CreateOrganizationCommand {
  name: string
  subdomain: string
  ownerId: string
  companySize?: CompanySize
  companyType?: CompanyType
}
