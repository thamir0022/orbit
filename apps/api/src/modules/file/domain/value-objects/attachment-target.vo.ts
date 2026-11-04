import { ValueObject } from '@/shared/domain'
import { AttachmentTargetType } from '../enums/attachment.enum'
import {
  FileDomainErrorCode,
  FileDomainException,
} from '../exceptions/file-domain.exception'
import { assertUuidV7 } from '../utils/file-domain-guards'

interface AttachmentTargetProps {
  readonly type: AttachmentTargetType
  readonly id: string
}

/** Stable polymorphic business reference; target access is checked by use cases. */
export class AttachmentTarget extends ValueObject<AttachmentTargetProps> {
  private constructor(props: AttachmentTargetProps) {
    super(props)
  }

  static create(type: AttachmentTargetType, id: string): AttachmentTarget {
    if (!Object.values(AttachmentTargetType).includes(type)) {
      throw new FileDomainException(
        FileDomainErrorCode.INVALID_TARGET,
        'Unsupported attachment target type'
      )
    }

    assertUuidV7(id, 'targetId')
    return new AttachmentTarget({ type, id })
  }

  get type(): AttachmentTargetType {
    return this.props.type
  }

  get id(): string {
    return this.props.id
  }
}
