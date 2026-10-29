import { DomainException } from '@/shared/domain'

// Clients must reload the sprint before retrying a conflicting write.
export class SprintConflictException extends DomainException {
  constructor(message = 'The sprint changed. Reload it and try again.') {
    super({ code: 'SPRINT_CONFLICT', message, statusCode: 409 })
  }
}
