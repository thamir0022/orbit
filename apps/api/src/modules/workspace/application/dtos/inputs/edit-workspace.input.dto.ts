import { CompanySize, CompanyType } from '@/shared/application/contracts'

export interface WorkspaceSettings {
  defaultPointsPerMemberPerDay?: number
  defaultHoursPerDay?: number
  defaultWorkingDaysPerWeek?: number
  defaultWorkingDaysPerSprint?: number
  logoUrl?: string
  primaryColor?: string
}

export interface EditWorkspaceInput {
  workspaceId: string
  userId: string
  name?: string
  slug?: string
  companySize?: CompanySize
  companyType?: CompanyType

  settings?: WorkspaceSettings
}
