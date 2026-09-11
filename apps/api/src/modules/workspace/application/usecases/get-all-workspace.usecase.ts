import { Inject } from '@nestjs/common'
import { IGetAllWorkspaceUseCase } from './get-all-workspace.interface'
import {
  type IWorkspaceRepository,
  WORKSPACE_REPOSITORY,
} from '../repository/workspace.repository.interface'
import { GetAllWorkspacesInput, GetAllWorkspaceOutput } from '../dtos'
import { WorkspaceMapper } from '../mappers/workspace.mapper'

export class GetAllWorkspaceUseCase implements IGetAllWorkspaceUseCase {
  constructor(
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: IWorkspaceRepository
  ) {}

  async execute({
    page = 1,
    limit = 12,
  }: GetAllWorkspacesInput): Promise<GetAllWorkspaceOutput> {
    const { data: workspaces, meta } = await this.workspaceRepository.findAll({
      page,
      limit,
    })

    return {
      workspaces: workspaces.map((workspace) =>
        WorkspaceMapper.toOutputDto(workspace)
      ),
      meta,
    }
  }
}
