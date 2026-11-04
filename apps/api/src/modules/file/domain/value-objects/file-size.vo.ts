import { ValueObject } from '@/shared/domain'
import { assertBytes } from '../utils/file-domain-guards'

interface FileSizeProps {
  readonly bytes: number
}

/** Immutable byte count. Limits are supplied by application policy. */
export class FileSize extends ValueObject<FileSizeProps> {
  private constructor(props: FileSizeProps) {
    super(props)
  }

  static create(bytes: number): FileSize {
    assertBytes(bytes, 'File size')
    return new FileSize({ bytes })
  }

  get bytes(): number {
    return this.props.bytes
  }
}
