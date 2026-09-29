import { ValueObject } from '@/shared/domain'
import { UuidUtil } from '@/shared/utils'

interface WorkItemIdProps {
  value: string
}

/**
 * Work Item ID Value Object
 * Encapsulates work item identifier validation and generation
 */
export class WorkItemId extends ValueObject<WorkItemIdProps> {
  private constructor(props: WorkItemIdProps) {
    super(props)
  }

  get value(): string {
    return this.props.value
  }

  static create(id?: string): WorkItemId {
    const value = id || UuidUtil.generate()

    if (id && !UuidUtil.isValid(id)) {
      throw new Error('Invalid Work Item ID format')
    }

    return new WorkItemId({ value })
  }

  static fromString(id: string): WorkItemId {
    return new WorkItemId({ value: id })
  }
}
