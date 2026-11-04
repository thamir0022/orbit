import { v7 as uuidv7 } from 'uuid'
import { ValueObject } from '@/shared/domain'
import { assertUuidV7 } from '../utils/file-domain-guards'

interface UploadSessionIdProps {
  readonly value: string
}

/** Strongly typed UUIDv7 identifier for UploadSessionId. */
export class UploadSessionId extends ValueObject<UploadSessionIdProps> {
  private constructor(props: UploadSessionIdProps) {
    super(props)
  }

  static create(value: string = uuidv7()): UploadSessionId {
    assertUuidV7(value, 'uploadSessionId')
    return new UploadSessionId({ value })
  }

  get value(): string {
    return this.props.value
  }

  toString(): string {
    return this.props.value
  }
}
