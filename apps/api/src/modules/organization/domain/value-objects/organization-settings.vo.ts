import { ValueObject } from '@/shared/domain'

export interface OrganizationSettingsProps {
  defaultPointsPerMemberPerDay: number
  defaultHoursPerDay: number
  defaultWorkingDaysPerWeek: number
  defaultWorkingDaysPerSprint: number
  logoUrl?: string
  primaryColor?: string
}
/**
 * Organization Setting VO
 */
export class OrganizationSettings extends ValueObject<OrganizationSettingsProps> {
  private constructor(props: OrganizationSettingsProps) {
    super(props)
  }

  // Factory for default settings (The "Business Rule" for new orgs)
  static createDefault(): OrganizationSettings {
    return new OrganizationSettings({
      defaultPointsPerMemberPerDay: 7,
      defaultHoursPerDay: 7,
      defaultWorkingDaysPerWeek: 5,
      defaultWorkingDaysPerSprint: 10,
    })
  }

  static create(props: OrganizationSettingsProps): OrganizationSettings {
    return new OrganizationSettings(props)
  }

  update(props: Partial<OrganizationSettingsProps>): OrganizationSettings {
    return new OrganizationSettings({
      ...this.props,
      ...props,
    })
  }

  toPersistence() {
    return {
      defaultPointsPerMemberPerDay: this.props.defaultPointsPerMemberPerDay,
      defaultHoursPerDay: this.props.defaultHoursPerDay,
      defaultWorkingDaysPerWeek: this.props.defaultWorkingDaysPerWeek,
      defaultWorkingDaysPerSprint: this.props.defaultWorkingDaysPerSprint,
      logoUrl: this.props.logoUrl,
      primaryColor: this.props.primaryColor,
    }
  }

  // Getters
  get defaultHoursPerDay(): number {
    return this.props.defaultHoursPerDay
  }

  get logoUrl(): string | undefined {
    return this.props.logoUrl
  }

  get primaryColor(): string | undefined {
    return this.props.logoUrl
  }
}
