import { ValueObject } from '@/shared/domain'
import { FileScopeType } from '../enums/file.enum'
import {
  FileDomainErrorCode,
  FileDomainException,
} from '../exceptions/file-domain.exception'
import { assertUuidV7 } from '../utils/file-domain-guards'

interface FileScopeProps {
  readonly type: FileScopeType
  readonly id: string
}

/** Identifies the tenant or account that owns a file. */
export class FileScope extends ValueObject<FileScopeProps> {
  private constructor(props: FileScopeProps) {
    super(props)
  }

  static workspace(workspaceId: string): FileScope {
    return FileScope.create(FileScopeType.WORKSPACE, workspaceId)
  }

  static user(userId: string): FileScope {
    return FileScope.create(FileScopeType.USER, userId)
  }

  static create(type: FileScopeType, id: string): FileScope {
    if (!Object.values(FileScopeType).includes(type)) {
      throw new FileDomainException(
        FileDomainErrorCode.INVALID_SCOPE,
        'Unsupported file scope'
      )
    }

    assertUuidV7(id, 'scopeId')
    return new FileScope({ type, id })
  }

  get type(): FileScopeType {
    return this.props.type
  }

  get id(): string {
    return this.props.id
  }
}
