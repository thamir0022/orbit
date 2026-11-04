import { v7 as uuidv7 } from 'uuid'
import { ValueObject } from '@/shared/domain'
import { assertUuidV7 } from '../utils/file-domain-guards'

interface FileIdProps {
  readonly value: string
}

/** Strongly typed UUIDv7 identifier for FileId. */
export class FileId extends ValueObject<FileIdProps> {
  private constructor(props: FileIdProps) {
    super(props)
  }

  static create(value: string = uuidv7()): FileId {
    assertUuidV7(value, 'fileId')
    return new FileId({ value })
  }

  get value(): string {
    return this.props.value
  }

  toString(): string {
    return this.props.value
  }
}
