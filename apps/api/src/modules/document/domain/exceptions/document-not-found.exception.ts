import { DomainException } from '@/shared/domain'
import { HttpStatus } from '@nestjs/common'

export class DocumentNotFoundException extends DomainException {
  constructor() {
    super({
      code: 'DOCUMENT_NOT_FOUND',
      message: 'Document not found',
      statusCode: HttpStatus.NOT_FOUND,
    })
  }
}
