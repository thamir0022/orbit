import { ProjectKey } from '@/modules/project/domain/value-objects/project-key.vo'
import { ValueObject } from '@/shared/domain'

import { WorkItemKeyInvalidException } from '../exceptions/work-item-key-invalid.exception'

interface WorkItemKeyProps {
  readonly value: string
}

export class WorkItemKey extends ValueObject<WorkItemKeyProps> {
  private static readonly NUMBER_WIDTH = 3

  private static readonly PATTERN = /^[A-Z0-9]{3}-\d+-\d+$/

  private constructor(props: WorkItemKeyProps) {
    super(props)
  }

  /**
   * Creates a WorkItemKey from an already generated value.
   *
   * Example:
   * ORB-001-001
   */
  static create(value: string): WorkItemKey {
    const normalizedValue = value.trim().toUpperCase()

    if (!WorkItemKey.PATTERN.test(normalizedValue)) {
      throw new WorkItemKeyInvalidException()
    }

    return new WorkItemKey({
      value: normalizedValue,
    })
  }

  /**
   * Generates a WorkItemKey from the project key and
   * project-scoped sequential work item number.
   *
   * Example:
   * ORB-001 + 1 → ORB-001-001
   */
  static generate(projectKey: ProjectKey, number: number): WorkItemKey {
    if (!Number.isInteger(number) || number <= 0) {
      throw new WorkItemKeyInvalidException()
    }

    const value = `${projectKey.value}-${number
      .toString()
      .padStart(WorkItemKey.NUMBER_WIDTH, '0')}`

    return WorkItemKey.create(value)
  }

  static fromString(value: string): WorkItemKey {
    return WorkItemKey.create(value)
  }

  get value(): string {
    return this.props.value
  }
}
