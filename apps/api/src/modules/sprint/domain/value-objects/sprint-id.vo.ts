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
    const value = id || UuidUtil.generate()

    if (id && !UuidUtil.isValid(id)) {
      throw new Error('Invalid UserId format')
    }

    return new SprintId({ value })
  }

  static fromString(id: string): SprintId {
    return new SprintId({ value: id })
  }
}
