import { ValueObject } from '@/shared/domain'
import { UuidUtil } from '@/shared/utils'

interface DocumentIdProps {
  value: string
}

/**
 * Document ID Value Object
 * Encapsulates org identifier validation and generation
 */
export class DocumentId extends ValueObject<DocumentIdProps> {
  private constructor(props: DocumentIdProps) {
    super(props)
  }

  get value(): string {
    return this.props.value
  }

  static create(id?: string): DocumentId {
    const value = id || UuidUtil.generate()

    if (id && !UuidUtil.isValid(id)) {
      throw new Error('Invalid document id format')
    }

    return new DocumentId({ value })
  }

  static fromString(id: string): DocumentId {
    return new DocumentId({ value: id })
  }
}
