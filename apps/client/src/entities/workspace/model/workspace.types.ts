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

export enum WorkspaceStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
}

export enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

export interface WorkspaceSettings {
  defaultPointsPerMemberPerDay: number
  defaultHoursPerDay: number
  defaultWorkingDaysPerWeek: number
  defaultWorkingDaysPerSprint: number
  logoUrl?: string
  primaryColor?: string
}

export interface WorkspaceLocation {
  country?: string
  state?: string
  city?: string
  addressLine1?: string
  addressLine2?: string
  postalCode?: string
}

export interface WorkspaceContactInfo {
  phone?: string
  email?: string
  website?: string
  linkedin?: string
  twitter?: string
  github?: string
}

export interface WorkspaceVerification {
  status: VerificationStatus
  verifiedAt?: Date
}

export interface Workspace {
  id: string
  name: string
  slug: string
  ownerId: string
  companySize?: CompanySize
  companyType?: CompanyType
  planId: string
  subscriptionId?: string
  trialEndsAt?: Date
  settings: WorkspaceSettings
  location?: WorkspaceLocation
  contactInfo?: WorkspaceContactInfo
  verification?: WorkspaceVerification
  status: WorkspaceStatus
  createdAt: Date
  updatedAt?: Date
}

export interface WorkspaceListItem {
  name: string
  slug: string
  logoUrl?: string
}
