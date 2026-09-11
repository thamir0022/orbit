import { CompanySize, CompanyType } from '@/shared/application/contracts'

export interface CreateWorkspaceInput {
  name: string
  slug: string
  companySize?: CompanySize
  companyType?: CompanyType
  userId: string
}
