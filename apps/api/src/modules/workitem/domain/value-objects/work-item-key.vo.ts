import { ValueObject } from '@/shared/domain'

import { WorkItemKeyInvalidException } from '../exceptions/work-item-key-invalid.exception'

interface WorkItemKeyProps {
  readonly value: string
}

export class WorkItemKey extends ValueObject<WorkItemKeyProps> {
  private static readonly TEAM_KEY_PATTERN = /^[A-Z][A-Z0-9]{0,9}$/

  private static readonly PATTERN = /^[A-Z][A-Z0-9]{0,9}-[1-9]\d*$/

  private constructor(props: WorkItemKeyProps) {
    super(props)
  }

  /** Creates a Work Item key from an existing value, e.g. ENG-123. */
  static create(value: string): WorkItemKey {
    const normalizedValue = value.trim().toUpperCase()

    if (!WorkItemKey.PATTERN.test(normalizedValue)) {
      throw new WorkItemKeyInvalidException()
    }

    return new WorkItemKey({ value: normalizedValue })
  }

  /** Generates a Work Item key from a team key and its allocated sequence. */
  static fromSequence(teamKey: string, sequence: number): WorkItemKey {
    const normalizedTeamKey = teamKey.trim().toUpperCase()

    if (
      !WorkItemKey.TEAM_KEY_PATTERN.test(normalizedTeamKey) ||
      !Number.isSafeInteger(sequence) ||
      sequence <= 0
    ) {
      throw new WorkItemKeyInvalidException()
    }

    return WorkItemKey.create(`${normalizedTeamKey}-${sequence}`)
  }

  /** Reconstitutes a Work Item key from its persisted value. */
  static fromString(value: string): WorkItemKey {
    return WorkItemKey.create(value)
  }

  get value(): string {
    return this.props.value
  }
}
