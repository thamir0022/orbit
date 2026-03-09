import { OrganizationDto } from '@/shared/domain/types/organization.dto'

export interface SignUpCompleteResponseDto {
  organization: OrganizationDto
  refreshToken: string
  expiresIn: Date
}
