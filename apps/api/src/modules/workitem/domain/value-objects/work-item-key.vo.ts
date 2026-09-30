import { ValueObject } from '@/shared/domain'
import { ProjectKey } from '@/modules/project/domain/value-objects/project-key.vo'
import { WorkItemKeyInvalidException } from '../exceptions'

interface WorkItemKeyProps {
  value: string
}

export class WorkItemKey extends ValueObject<WorkItemKeyProps> {
  private static readonly PATTERN = /^[A-Z][A-Z0-9]{1,9}-[1-9]\d*$/

  private constructor(value: WorkItemKeyProps) {
    super(value)
  }

  static create(projectKey: ProjectKey, number: number): WorkItemKey {
    if (!Number.isInteger(number) || number <= 0) {
      throw new WorkItemKeyInvalidException()
    }

    const value = `${projectKey.value}-${number}`

    if (!WorkItemKey.PATTERN.test(value)) {
      throw new WorkItemKeyInvalidException()
    }

    return new WorkItemKey({ value })
  }

  static fromString(value: string): WorkItemKey {
    const normalizedValue = value.trim().toUpperCase()

    if (!WorkItemKey.PATTERN.test(normalizedValue)) {
      throw new WorkItemKeyInvalidException()
    }

    return new WorkItemKey({ value: normalizedValue })
  }

  get value(): string {
    return this.props.value
  }
}
