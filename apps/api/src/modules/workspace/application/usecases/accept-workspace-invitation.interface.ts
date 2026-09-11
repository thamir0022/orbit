import {
  AcceptWorkspaceInvitationInput,
  AcceptWorkspaceInvitationOutput,
} from '../dtos'

export interface IAcceptWorkspaceInvitationUseCase {
  execute(
    input: AcceptWorkspaceInvitationInput
  ): Promise<AcceptWorkspaceInvitationOutput>
}

export const ACCEPT_WORKSPACE_INVITATION = Symbol(
  'IAcceptWorkspaceInvitationUseCase'
)
