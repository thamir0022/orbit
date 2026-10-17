import { randomBytes } from 'node:crypto'

import { ValueObject } from '@/shared/domain'

import { TeamKeyInvalidException } from '../exceptions'

interface TeamKeyProps {
  readonly value: string
}

export class TeamKey extends ValueObject<TeamKeyProps> {
  private static readonly PREFIX_LENGTH = 3
  private static readonly RANDOM_SUFFIX_BYTES = 4
  private static readonly PATTERN = /^[A-Z0-9]{3}-[A-F0-9]{8}$/

  private constructor(props: TeamKeyProps) {
    super(props)
  }

  /** Creates a team key from an existing value. */
  static create(value: string): TeamKey {
    const normalizedValue = value.trim().toUpperCase()

    if (!TeamKey.PATTERN.test(normalizedValue)) {
      throw new TeamKeyInvalidException()
    }

    return new TeamKey({ value: normalizedValue })
  }

  /** Generates a team key, e.g. ENG-A1B2C3D4. */
  static generate(teamName: string): TeamKey {
    const prefix = teamName
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, TeamKey.PREFIX_LENGTH)

    if (prefix.length !== TeamKey.PREFIX_LENGTH) {
      throw new TeamKeyInvalidException()
    }

    const suffix = randomBytes(TeamKey.RANDOM_SUFFIX_BYTES)
      .toString('hex')
      .toUpperCase()

    return TeamKey.create(`${prefix}-${suffix}`)
  }

  get value(): string {
    return this.props.value
  }
}
