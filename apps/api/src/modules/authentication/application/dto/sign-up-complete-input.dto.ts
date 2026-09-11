import { ClientInfo } from '../contracts/client-info'
import { CompanySize } from '@/shared/application/contracts/company-size'
import { CompanyType } from '@/shared/application/contracts/company-type'

export interface SignUpCompleteInputDto {
  name: string
  slug: string
  companySize?: CompanySize
  companyType?: CompanyType
  registrationToken: string
  clientInfo: ClientInfo
}
