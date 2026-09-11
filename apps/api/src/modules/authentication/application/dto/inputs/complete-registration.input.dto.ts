import { ClientInfo } from '../../contracts/client-info'

export interface CompleteRegistrationInput {
  readonly registrationToken: string
  readonly invitationToken: string
  readonly firstName: string
  readonly lastName: string
  readonly password: string
  readonly clientInfo: ClientInfo
}
