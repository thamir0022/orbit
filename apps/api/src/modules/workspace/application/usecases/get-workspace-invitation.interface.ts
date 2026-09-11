import {
  GetWorkspaceInvitationInput,
  GetWorkspaceInvitationOutput,
} from '../dtos'

export interface IGetWorkspaceInvitationUseCase {
  execute(
    input: GetWorkspaceInvitationInput
  ): Promise<GetWorkspaceInvitationOutput>
}

export const GET_WORKSPACE_INVITATION = Symbol('GET_WORKSPACE_INVITATION')
