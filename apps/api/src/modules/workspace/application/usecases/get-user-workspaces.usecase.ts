import { Inject, Logger } from '@nestjs/common'
import { GetUserWorkspaceInputDto, GetUserWorkspaceOutputDto } from '../dtos'
import { IGetUserWorkspacesUseCase } from './get-user-workspaces.interface'
import {
  type IWorkspaceRepository,
  WORKSPACE_REPOSITORY,
} from '../repository/workspace.repository.interface'

export class GetUserWorkspacesUseCase implements IGetUserWorkspacesUseCase {
  private readonly logger = new Logger(GetUserWorkspacesUseCase.name)
  constructor(
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: IWorkspaceRepository
  ) {}

  async execute({
    userId,
  }: GetUserWorkspaceInputDto): Promise<GetUserWorkspaceOutputDto> {
    this.logger.debug(`Fetching workspaces for user: ${userId}`)

    const workspaces = await this.workspaceRepository.findByUserId({
      userId,
    })

    return { workspaces }
  }
}
