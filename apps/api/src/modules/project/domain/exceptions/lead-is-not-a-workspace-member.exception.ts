import { HttpStatus } from '@nestjs/common'

import { DomainException } from '@/shared/domain'

export class LeadIsNotAWorkspaceMemberException extends DomainException {
  constructor() {
    super({
      code: 'LEAD_IS_NOT_A_WORKSPACE_MEMBER',
      message: 'Project lead must be a member of the workspace',
      statusCode: HttpStatus.BAD_REQUEST,
    })
  }
}
