import { ValueObject } from '@/shared/domain'
import { UuidUtil } from '@/shared/utils'

interface TeamMemberIdProps {
  value: string
}

/**
 * Team Member ID Value Object
 * Encapsulates org identifier validation and generation
 */
export class TeamMemberId extends ValueObject<TeamMemberIdProps> {
  private constructor(props: TeamMemberIdProps) {
    super(props)
  }

  get value(): string {
    return this.props.value
  }

  static create(id?: string): TeamMemberId {
    const value = id || UuidUtil.generate()

    if (id && !UuidUtil.isValid(id)) {
      throw new Error('Invalid UserId format')
    }

    return new TeamMemberId({ value })
  }

  static fromString(id: string): TeamMemberId {
    return new TeamMemberId({ value: id })
  }
}
