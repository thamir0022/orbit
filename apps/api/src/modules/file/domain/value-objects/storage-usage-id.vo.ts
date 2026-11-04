import { v7 as uuidv7 } from 'uuid'
import { ValueObject } from '@/shared/domain'
import { assertUuidV7 } from '../utils/file-domain-guards'

interface StorageUsageIdProps {
  readonly value: string
}

/** Strongly typed UUIDv7 identifier for StorageUsageId. */
export class StorageUsageId extends ValueObject<StorageUsageIdProps> {
  private constructor(props: StorageUsageIdProps) {
    super(props)
  }

  static create(value: string = uuidv7()): StorageUsageId {
    assertUuidV7(value, 'storageUsageId')
    return new StorageUsageId({ value })
  }

  get value(): string {
    return this.props.value
  }

  toString(): string {
    return this.props.value
  }
}
