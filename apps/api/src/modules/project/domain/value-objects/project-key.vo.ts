import { ValueObject } from '@/shared/domain'
import { ProjectKeyInvalidException } from '../exceptions/project-key-invalid.exception'

interface WorkItemProps {
  value: string
}

export class ProjectKey extends ValueObject<WorkItemProps> {
  private static readonly PATTERN = /^[A-Z][A-Z0-9]{1,9}$/
  private static readonly MAX_LENGTH = 10

  private constructor(value: WorkItemProps) {
    super(value)
  }

  static create(value: string): ProjectKey {
    const normalizedValue = value.trim().toUpperCase()

    if (
      !normalizedValue ||
      normalizedValue.length > ProjectKey.MAX_LENGTH ||
      !ProjectKey.PATTERN.test(normalizedValue)
    ) {
      throw new ProjectKeyInvalidException()
    }

    return new ProjectKey({ value: normalizedValue })
  }

  static fromString(value: string): ProjectKey {
    return ProjectKey.create(value)
  }

  get value(): string {
    return this.props.value
  }
}
