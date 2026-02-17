import { ValueObject } from '@/shared/domain'
import { UuidUtil } from '@/shared/utils'

interface UserIdProps {
  value: string
}

/**
 * Organization ID (Tenent ID) Value Object
 * Encapsulates org identifier validation and generation
 */
export class OrganizationId extends ValueObject<UserIdProps> {
  private constructor(props: UserIdProps) {
    super(props)
  }

  get value(): string {
    return this.props.value
  }

  static create(id?: string): OrganizationId {
    const value = id || UuidUtil.generate()

    if (id && !UuidUtil.isValid(id)) {
      throw new Error('Invalid UserId format')
    }

    return new OrganizationId({ value })
  }

  static fromString(id: string): OrganizationId {
    return new OrganizationId({ value: id })
  }
}
