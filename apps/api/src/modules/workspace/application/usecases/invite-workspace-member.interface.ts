import {
  InviteWorkspaceMemberInput,
  InviteWorkspaceMemberOutput,
} from '../dtos'

export interface IInviteWorkspaceMemberUseCase {
  execute(
    input: InviteWorkspaceMemberInput
  ): Promise<InviteWorkspaceMemberOutput>
}

export const INVITE_WORKSPACE_MEMBER = Symbol('INVITE_WORKSPACE_MEMBER')
