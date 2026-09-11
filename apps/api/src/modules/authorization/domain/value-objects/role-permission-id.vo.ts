import { ValueObject } from '@/shared/domain'
import { UuidUtil } from '@/shared/utils'

interface RolePermissionIdProps {
  value: string
}

export class RolePermissionId extends ValueObject<RolePermissionIdProps> {
  private constructor(props: RolePermissionIdProps) {
    super(props)
  }

  get value(): string {
    return this.props.value
  }

  static create(id?: string): RolePermissionId {
    const value = id || UuidUtil.generate()

    if (id && !UuidUtil.isValid(id)) {
      throw new Error('Invalid RolePermissionId format')
    }

    return new RolePermissionId({ value })
  }

  static fromString(id: string): RolePermissionId {
    return new RolePermissionId({ value: id })
  }
}
