import { UpdateWorkspaceMemberInput } from '../dtos'
import { UpdateWorkspaceMemberOutput } from '../dtos/outputs/update-workspace-member.output.dto'

export interface IUpdateWorkspaceMemberUseCase {
  execute(
    input: UpdateWorkspaceMemberInput
  ): Promise<UpdateWorkspaceMemberOutput>
}

export const UPDATE_WORKSPACE_MEMBER = Symbol('IUpdateWorkspaceMemberUseCase')
