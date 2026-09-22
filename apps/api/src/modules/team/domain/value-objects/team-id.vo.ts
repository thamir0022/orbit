import { ValueObject } from '@/shared/domain'
import { UuidUtil } from '@/shared/utils'

interface TeamIdProps {
  value: string
}

/**
 * Team ID Value Object
 * Encapsulates org identifier validation and generation
 */
export class TeamId extends ValueObject<TeamIdProps> {
  private constructor(props: TeamIdProps) {
    super(props)
  }

  get value(): string {
    return this.props.value
  }

  static create(id?: string): TeamId {
    const value = id || UuidUtil.generate()

    if (id && !UuidUtil.isValid(id)) {
      throw new Error('Invalid UserId format')
    }

    return new TeamId({ value })
  }

  static fromString(id: string): TeamId {
    return new TeamId({ value: id })
  }
}
