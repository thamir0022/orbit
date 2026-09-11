import { ValueObject } from '@/shared/domain'
import { UuidUtil } from '@/shared/utils'

interface UserRoleIdProps {
  value: string
}

export class UserRoleId extends ValueObject<UserRoleIdProps> {
  private constructor(props: UserRoleIdProps) {
    super(props)
  }

  get value(): string {
    return this.props.value
  }

  static create(id?: string): UserRoleId {
    const value = id || UuidUtil.generate()

    if (id && !UuidUtil.isValid(id)) {
      throw new Error('Invalid UserRoleId format')
    }

    return new UserRoleId({ value })
  }

  static fromString(id: string): UserRoleId {
    return new UserRoleId({ value: id })
  }
}
