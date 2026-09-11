import { ValueObject } from '@/shared/domain'
import { UuidUtil } from '@/shared/utils'

interface WorkspaceInvitationIdProps {
  value: string
}

/**
 * Workspace Invitation ID Value Object
 * Encapsulates workspace invitation identifier validation and generation
 */
export class WorkspaceInvitationId extends ValueObject<WorkspaceInvitationIdProps> {
  private constructor(props: WorkspaceInvitationIdProps) {
    super(props)
  }

  get value(): string {
    return this.props.value
  }

  static create(id?: string): WorkspaceInvitationId {
    const value = id || UuidUtil.generate()

    if (id && !UuidUtil.isValid(id)) {
      throw new Error('Invalid WorkspaceInvitationId format')
    }

    return new WorkspaceInvitationId({ value })
  }

  static fromString(id: string): WorkspaceInvitationId {
    return new WorkspaceInvitationId({ value: id })
  }
}
