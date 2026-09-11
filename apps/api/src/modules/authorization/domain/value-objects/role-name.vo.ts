import { Result, ValueObject } from '@/shared/domain'

interface RoleNameProps {
  value: string
}

export class RoleName extends ValueObject<RoleNameProps> {
  private static readonly MIN_LENGTH = 2
  private static readonly MAX_LENGTH = 50

  private constructor(props: RoleNameProps) {
    super(props)
  }

  get value(): string {
    return this.props.value
  }

  private static normalize(name: string): string {
    return name.trim()
  }

  static create(name: string): Result<RoleName, string> {
    const normalizedName = this.normalize(name)

    if (!normalizedName) {
      return Result.fail('Role name is required')
    }

    if (normalizedName.length < this.MIN_LENGTH) {
      return Result.fail(
        `Role name must be at least ${this.MIN_LENGTH} characters`
      )
    }

    if (normalizedName.length > this.MAX_LENGTH) {
      return Result.fail(
        `Role name cannot exceed ${this.MAX_LENGTH} characters`
      )
    }

    return Result.ok(
      new RoleName({
        value: normalizedName,
      })
    )
  }
}
