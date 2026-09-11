import {
  CompanySize,
  CompanyType,
  WorkspaceStatus,
  VerificationStatus,
} from '@/modules/workspace/domain'

export interface WorkspaceDto {
  id: string
  name: string
  slug: string
  ownerId: string
  companySize?: CompanySize
  companyType?: CompanyType

  planId: string
  subscriptionId?: string
  trialEndsAt?: Date

  settings: {
    defaultPointsPerMemberPerDay: number
    defaultHoursPerDay: number
    defaultWorkingDaysPerWeek: number
    defaultWorkingDaysPerSprint: number
    logoUrl?: string
    primaryColor?: string
  }
  location?: {
    country?: string
    state?: string
    city?: string
    addressLine1?: string
    addressLine2?: string
    postalCode?: string
  }
  contactInfo?: {
    phone?: string
    email?: string
    website?: string
    linkedin?: string
    twitter?: string
    github?: string
  }
  verification?: {
    status: VerificationStatus
    verifiedAt?: Date
  }

  status: WorkspaceStatus

  createdAt: Date
  updatedAt?: Date
  deletedAt?: Date
}
