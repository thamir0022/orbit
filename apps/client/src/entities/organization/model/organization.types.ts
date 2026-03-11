export enum CompanySize {
  SOLO = 'solo',
  SMALL_2_10 = 'small_2_10',
  SMALL_11_50 = 'small_11_50',
  MEDIUM_51_100 = 'medium_51_100',
  MEDIUM_101_250 = 'medium_101_250',
  LARGE_251_500 = 'large_251_500',
  ENTERPRISE_500_PLUS = 'enterprise_500_plus',
}

export enum CompanyType {
  STARTUP = 'startup',
  SME = 'sme',
  ENTERPRISE = 'enterprise',
  NON_PROFIT = 'non_profit',
  GOVERNMENT = 'government',
  AGENCY = 'agency',
  EDUCATIONAL = 'educational',
  FREELANCER = 'freelancer',
  OTHER = 'other',
}

export enum OrganizationStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
}

export enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

export interface Organization {
  id: string
  name: string
  subdomain: string
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

  status: OrganizationStatus

  createdAt: Date
  updatedAt?: Date
  deletedAt?: Date
}
