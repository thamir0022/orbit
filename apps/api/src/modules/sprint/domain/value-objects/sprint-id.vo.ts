import { SprintValidationException } from '../exceptions/sprint-validation.exception'
import { ValueObject } from '@/shared/domain'
import { UuidUtil } from '@/shared/utils'

interface SprintIdProps {
  value: string
}

/**
 * Sprint ID Value Object
 * Encapsulates sprint identifier validation and generation
 */
export class SprintId extends ValueObject<SprintIdProps> {
  private constructor(props: SprintIdProps) {
    super(props)
  }

  get value(): string {
    return this.props.value
  }

  static create(id?: string): SprintId {
    // Only omitted IDs request generation; empty IDs are invalid.
    const value = id ?? UuidUtil.generate()

    if (!UuidUtil.isValid(value)) {
      throw new SprintValidationException('Invalid sprint ID format')
    }

    return new SprintId({ value })
  }

  static fromString(id: string): SprintId {
    return SprintId.create(id)
  }
}
