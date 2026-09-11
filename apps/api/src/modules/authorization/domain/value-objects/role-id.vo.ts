import { ValueObject } from '@/shared/domain'
import { UuidUtil } from '@/shared/utils'

interface RoleIdProps {
  value: string
}

export class RoleId extends ValueObject<RoleIdProps> {
  private constructor(props: RoleIdProps) {
    super(props)
  }

  get value(): string {
    return this.props.value
  }

  static create(id?: string): RoleId {
    const value = id || UuidUtil.generate()

    if (id && !UuidUtil.isValid(id)) {
      throw new Error('Invalid RoleId format')
    }

    return new RoleId({ value })
  }

  static fromString(id: string): RoleId {
    return new RoleId({ value: id })
  }
}
