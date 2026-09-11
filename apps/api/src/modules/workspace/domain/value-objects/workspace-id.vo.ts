import { ValueObject } from '@/shared/domain'
import { UuidUtil } from '@/shared/utils'

interface UserIdProps {
  value: string
}

/**
 * Workspace ID (Tenent ID) Value Object
 * Encapsulates org identifier validation and generation
 */
export class WorkspaceId extends ValueObject<UserIdProps> {
  private constructor(props: UserIdProps) {
    super(props)
  }

  get value(): string {
    return this.props.value
  }

  static create(id?: string): WorkspaceId {
    const value = id || UuidUtil.generate()

    if (id && !UuidUtil.isValid(id)) {
      throw new Error('Invalid UserId format')
    }

    return new WorkspaceId({ value })
  }

  static fromString(id: string): WorkspaceId {
    return new WorkspaceId({ value: id })
  }
}
