import { Result, ValueObject } from '@/shared/domain'

interface PermissionKeyProps {
  value: string
}

export class PermissionKey extends ValueObject<PermissionKeyProps> {
  private static readonly KEY_REGEX = /^[a-z][a-z0-9_-]*:[a-z][a-z0-9_-]*$/

  private constructor(props: PermissionKeyProps) {
    super(props)
  }

  get value(): string {
    return this.props.value
  }

  private static normalize(key: string): string {
    return key.trim().toLowerCase()
  }

  static create(key: string): Result<PermissionKey, string> {
    const normalizedKey = this.normalize(key)

    if (!normalizedKey) {
      return Result.fail('Permission key is required')
    }

    if (!this.KEY_REGEX.test(normalizedKey)) {
      return Result.fail(
        'Permission key must follow format: module.resource.action'
      )
    }

    return Result.ok(
      new PermissionKey({
        value: normalizedKey,
      })
    )
  }
}
