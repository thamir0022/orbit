import { ValueObject } from '@/shared/domain'
import {
  FileDomainErrorCode,
  FileDomainException,
} from '../exceptions/file-domain.exception'

interface FileMimeTypeProps {
  readonly value: string
}

/** Syntactically valid MIME type, not proof of the file's contents. */
export class FileMimeType extends ValueObject<FileMimeTypeProps> {
  private constructor(props: FileMimeTypeProps) {
    super(props)
  }

  static create(value: string): FileMimeType {
    const normalized = value.trim().toLowerCase()
    const pattern = /^[a-z0-9][a-z0-9!#$&^_.+-]*\/[a-z0-9][a-z0-9!#$&^_.+-]*$/

    if (normalized.length > 127 || !pattern.test(normalized)) {
      throw new FileDomainException(
        FileDomainErrorCode.INVALID_MIME_TYPE,
        'Invalid MIME type'
      )
    }

    return new FileMimeType({ value: normalized })
  }

  get value(): string {
    return this.props.value
  }
}
