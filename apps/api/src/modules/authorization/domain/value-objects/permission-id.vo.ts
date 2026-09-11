import { ValueObject } from '@/shared/domain'
import { UuidUtil } from '@/shared/utils'

interface PermissionIdProps {
  value: string
}

export class PermissionId extends ValueObject<PermissionIdProps> {
  private constructor(props: PermissionIdProps) {
    super(props)
  }

  get value(): string {
    return this.props.value
  }

  static create(id?: string): PermissionId {
    const value = id || UuidUtil.generate()

    if (id && !UuidUtil.isValid(id)) {
      throw new Error('Invalid PermissionId format')
    }

    return new PermissionId({ value })
  }

  static fromString(id: string): PermissionId {
    return new PermissionId({ value: id })
  }
}
