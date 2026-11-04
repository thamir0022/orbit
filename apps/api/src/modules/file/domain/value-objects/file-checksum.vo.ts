import { ValueObject } from '@/shared/domain'
import {
  FileDomainErrorCode,
  FileDomainException,
} from '../exceptions/file-domain.exception'

interface FileChecksumProps {
  readonly sha256: string
}

/** Verified SHA-256 digest, stored as 64 lowercase hexadecimal characters. */
export class FileChecksum extends ValueObject<FileChecksumProps> {
  private constructor(props: FileChecksumProps) {
    super(props)
  }

  static create(sha256: string): FileChecksum {
    const normalized = sha256.trim().toLowerCase()

    if (!/^[a-f0-9]{64}$/.test(normalized)) {
      throw new FileDomainException(
        FileDomainErrorCode.INVALID_CHECKSUM,
        'SHA-256 checksum must be 64 hexadecimal characters'
      )
    }

    return new FileChecksum({ sha256: normalized })
  }

  get sha256(): string {
    return this.props.sha256
  }
}
