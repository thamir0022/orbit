import { DomainException } from '@/shared/domain'

// Keep expected validation failures in the standard API error envelope.
export class SprintValidationException extends DomainException {
  constructor(message: string) {
    super({ code: 'INVALID_SPRINT', message })
  }
}
