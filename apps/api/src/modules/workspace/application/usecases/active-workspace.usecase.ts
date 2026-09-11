import { ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common'
import {
  type IWorkspaceRepository,
  WORKSPACE_REPOSITORY,
} from '../repository/workspace.repository.interface'
import { IGetActiveWorkspace } from './active-workspace.interface'
import {
  GetActiveWorkspaceInputDto,
  GetActiveWorkspaceOutputDto,
} from '../dtos'
import { WorkspaceMapper } from '../mappers/workspace.mapper'

@Injectable()
export class GetActiveWorkspaceUseCase implements IGetActiveWorkspace {
  private readonly logger = new Logger(GetActiveWorkspaceUseCase.name)

  constructor(
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: IWorkspaceRepository
  ) {}

  async execute({
    workspaceId,
    userId,
  }: GetActiveWorkspaceInputDto): Promise<GetActiveWorkspaceOutputDto> {
    this.logger.debug(`Fetching active workspace context for user: ${userId}`)

    if (!workspaceId) throw new Error('Tenant ID is required')

    // Pass the parameters as a single object
    const workspaceContext = await this.workspaceRepository.findActiveContext({
      workspaceId,
      userId,
    })

    this.logger.debug('WORKSPACE CONTEXT : ', workspaceContext)

    if (!workspaceContext) {
      this.logger.warn(
        `User ${userId} attempted to access tenant ${workspaceId} but lacks DB membership.`
      )
      throw new ForbiddenException(
        'You no longer have access to this workspace.'
      )
    }

    return {
      workspace: WorkspaceMapper.toOutputDto(workspaceContext.workspace),
    }
  }
}
