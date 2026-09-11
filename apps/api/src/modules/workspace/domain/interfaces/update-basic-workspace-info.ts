import { CompanySize, CompanyType } from '../enums'

export interface UpdateBasicWorkspaceInfoProps {
  name?: string
  slug?: string
  companySize?: CompanySize
  companyType?: CompanyType
}
