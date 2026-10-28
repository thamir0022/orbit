import { DomainException } from '@/shared/domain'

export class TeamStoryAccessDeniedException extends DomainException {
  constructor() {
    super({
      code: 'TEAM_STORY_ACCESS_DENIED',
      message:
        'An active workspace membership is required to manage team stories.',
      statusCode: 403,
    })
  }
}
