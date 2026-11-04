import { ValueObject } from '@/shared/domain'
import {
  FileDomainErrorCode,
  FileDomainException,
} from '../exceptions/file-domain.exception'

interface StorageObjectRefProps {
  readonly locationId: string
  readonly key: string
  readonly versionId: string | null
}

/** Opaque object location; contains no URLs, credentials, or provider SDK types. */
export class StorageObjectRef extends ValueObject<StorageObjectRefProps> {
  private constructor(props: StorageObjectRefProps) {
    super(props)
  }

  static create(input: {
    locationId: string
    key: string
    versionId?: string | null
  }): StorageObjectRef {
    const locationId = input.locationId.trim()
    const key = input.key.trim()
    const versionId = input.versionId ?? null
    const keySegments = key.split('/')

    if (
      !/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/.test(locationId) ||
      new TextEncoder().encode(key).length > 1024 ||
      !/^[a-zA-Z0-9][a-zA-Z0-9_./=-]*$/.test(key) ||
      keySegments.some(
        (segment) => segment === '.' || segment === '..' || !segment
      ) ||
      (versionId !== null && (versionId.length === 0 || versionId.length > 255))
    ) {
      throw new FileDomainException(
        FileDomainErrorCode.INVALID_STORAGE_OBJECT,
        'Invalid storage object reference'
      )
    }

    return new StorageObjectRef({ locationId, key, versionId })
  }

  get locationId(): string {
    return this.props.locationId
  }

  get key(): string {
    return this.props.key
  }

  get versionId(): string | null {
    return this.props.versionId
  }
}
