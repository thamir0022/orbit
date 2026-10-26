import { ValueObject } from '@/shared/domain'

import { TeamKeyInvalidException } from '../exceptions'

interface TeamKeyProps {
  readonly value: string
}

export class TeamKey extends ValueObject<TeamKeyProps> {
  private static readonly MAX_LENGTH = 10

  private static readonly PATTERN = /^[A-Z][A-Z0-9]{0,9}$/

  private constructor(props: TeamKeyProps) {
    super(props)
  }

  /**
   * Creates a team key from an existing value.
   *
   * Examples: ENG, QA, API
   */
  static create(value: string): TeamKey {
    const normalizedValue = value.trim().toUpperCase()

    if (
      normalizedValue.length > TeamKey.MAX_LENGTH ||
      !TeamKey.PATTERN.test(normalizedValue)
    ) {
      throw new TeamKeyInvalidException()
    }

    return new TeamKey({ value: normalizedValue })
  }

  /**
   * Generates a candidate team key from a team name.
   *
   * Examples:
   * "Engineering" -> ENG
   * "Quality Assurance" -> QUA
   * "API Team" -> API
   * "3D Design" -> T3D
   *
   * This does not guarantee uniqueness within a workspace.
   * The application layer must resolve key conflicts.
   */
  static generate(teamName: string): TeamKey {
    const normalizedName = teamName
      .trim()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')

    if (!normalizedName) {
      throw new TeamKeyInvalidException()
    }

    let prefix = normalizedName.slice(0, 3)

    // Team keys must start with a letter.
    if (!/^[A-Z]/.test(prefix)) {
      prefix = `T${prefix.slice(0, 2)}`
    }

    // Ensure short names still produce a valid candidate.
    if (prefix.length === 1) {
      prefix = `${prefix}T`
    }

    return TeamKey.create(prefix)
  }

  get value(): string {
    return this.props.value
  }
}
