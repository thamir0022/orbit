import { DomainException } from '@/shared/domain'
import { HttpStatus } from '@nestjs/common'

export class OrganizationAlreadyExists extends DomainException {
  constructor(subdomain?: string) {
    super({
      code: 'ORGANIZATION_ALREADY_EXISTS',
      message: subdomain
        ? `Organization with subdomain '${subdomain}' already exists`
        : 'Organization already exists',
      statusCode: HttpStatus.CONFLICT,
    })
  }
}
