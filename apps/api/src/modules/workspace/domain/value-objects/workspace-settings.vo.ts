import { ValueObject } from '@/shared/domain'

export interface WorkspaceSettingsProps {
  defaultPointsPerMemberPerDay: number
  defaultHoursPerDay: number
  defaultWorkingDaysPerWeek: number
  defaultWorkingDaysPerSprint: number
  logoUrl?: string
  primaryColor?: string
}

export type RawWorkspaceSettingsProps = WorkspaceSettingsProps

const DEFAULT_WORKSPACE_SETTINGS: WorkspaceSettingsProps = {
  defaultPointsPerMemberPerDay: 7,
  defaultHoursPerDay: 7,
  defaultWorkingDaysPerWeek: 5,
  defaultWorkingDaysPerSprint: 10,
}

export class WorkspaceSettings extends ValueObject<WorkspaceSettingsProps> {
  private constructor(props: WorkspaceSettingsProps) {
    super(props)
  }

  static createDefault(): WorkspaceSettings {
    return new WorkspaceSettings({ ...DEFAULT_WORKSPACE_SETTINGS })
  }

  static create(
    props: Partial<WorkspaceSettingsProps> = {}
  ): WorkspaceSettings {
    return new WorkspaceSettings({
      ...DEFAULT_WORKSPACE_SETTINGS,
      ...props,
    })
  }

  static fromPersistence(
    raw?: Partial<RawWorkspaceSettingsProps> | null
  ): WorkspaceSettings {
    if (!raw) return WorkspaceSettings.createDefault()
    return WorkspaceSettings.create(raw)
  }

  update(props: Partial<WorkspaceSettingsProps>): WorkspaceSettings {
    return new WorkspaceSettings({
      ...this.props,
      ...props,
    })
  }

  toPersistence(): RawWorkspaceSettingsProps {
    return {
      defaultPointsPerMemberPerDay: this.props.defaultPointsPerMemberPerDay,
      defaultHoursPerDay: this.props.defaultHoursPerDay,
      defaultWorkingDaysPerWeek: this.props.defaultWorkingDaysPerWeek,
      defaultWorkingDaysPerSprint: this.props.defaultWorkingDaysPerSprint,
      logoUrl: this.props.logoUrl,
      primaryColor: this.props.primaryColor,
    }
  }

  toPrimitives(): RawWorkspaceSettingsProps {
    return this.toPersistence()
  }

  get defaultHoursPerDay(): number {
    return this.props.defaultHoursPerDay
  }

  get logoUrl(): string | undefined {
    return this.props.logoUrl
  }

  get primaryColor(): string | undefined {
    return this.props.primaryColor
  }
}
