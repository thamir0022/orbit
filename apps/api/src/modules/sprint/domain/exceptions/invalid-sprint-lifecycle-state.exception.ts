import { HttpStatus } from '@nestjs/common'
import { DomainException } from '@/shared/domain'
import { SprintId } from '../value-objects/sprint-id.vo'

export class InvalidSprintLifeCycleState extends DomainException {
  constructor(sprintId: SprintId) {
    super({
      code: 'SPRINT_START_FAILED',
      message: `Invalid lifecycle state for Sprint "${sprintId.value}".`,
      statusCode: HttpStatus.CONFLICT,
    })
  }
}
