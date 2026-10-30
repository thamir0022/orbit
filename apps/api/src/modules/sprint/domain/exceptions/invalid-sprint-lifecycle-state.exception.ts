import { HttpStatus } from '@nestjs/common'
import { DomainException } from '@/shared/domain'
import { SprintId } from '../value-objects/sprint-id.vo'

export class InvalidSprintLifeCycleState extends DomainException {
  constructor(sprintId: SprintId) {
    super({
      // Distinguish corrupt stored state from a rejected start command.
      code: 'INVALID_SPRINT_LIFECYCLE_STATE',
      message: `Invalid lifecycle state for Sprint "${sprintId.value}".`,
      statusCode: HttpStatus.CONFLICT,
    })
  }
}
