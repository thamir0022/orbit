import { v7 as uuidv7 } from 'uuid'
import { ValueObject } from '@/shared/domain'
import { assertUuidV7 } from '../utils/file-domain-guards'

interface AttachmentIdProps {
  readonly value: string
}

/** Strongly typed UUIDv7 identifier for AttachmentId. */
export class AttachmentId extends ValueObject<AttachmentIdProps> {
  private constructor(props: AttachmentIdProps) {
    super(props)
  }

  static create(value: string = uuidv7()): AttachmentId {
    assertUuidV7(value, 'attachmentId')
    return new AttachmentId({ value })
  }

  get value(): string {
    return this.props.value
  }

  toString(): string {
    return this.props.value
  }
}
