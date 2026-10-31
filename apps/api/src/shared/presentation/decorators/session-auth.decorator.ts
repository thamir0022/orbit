import { SetMetadata } from '@nestjs/common'

export const SESSION_AUTH_KEY = 'sessionAuth'

// Only for operations that need a user identity without a selected workspace.
export const SessionAuth = () => SetMetadata(SESSION_AUTH_KEY, true)
