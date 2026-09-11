import { Inject, Logger } from '@nestjs/common'
import { EditWorkspaceInput, EditWorkspaceOutput } from '../dtos'
import { IEditWorkspaceUseCase } from './edit-workspace.interface'
import {
  type IWorkspaceRepository,
  WORKSPACE_REPOSITORY,
} from '../repository/workspace.repository.interface'
import {
  WorkspaceAlreadyExistsException,
  WorkspaceNotActiveException,
  WorkspaceNotFoundException,
} from '../../domain/exceptions/workspace.exception'
import { WorkspaceStatus } from '../../domain'
import { WorkspaceMapper } from '../mappers/workspace.mapper'

export class EditWorkspaceUseCase implements IEditWorkspaceUseCase {
  private readonly logger = new Logger(EditWorkspaceUseCase.name)

  constructor(
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: IWorkspaceRepository
  ) {}

  async execute({
    workspaceId,
    userId,
    name,
    slug,
    companySize,
    companyType,
    settings,
  }: EditWorkspaceInput): Promise<EditWorkspaceOutput> {
    this.logger.log(`Workspace edit for ${workspaceId} by ${userId}`)

    this.logger.debug('INPUT : ', {
      userId,
      workspaceId,
      name,
      slug,
      companySize,
      companyType,
      settings,
    })

    const workspaceContext = await this.workspaceRepository.findActiveContext({
      workspaceId,
      userId,
    })

    this.logger.debug('ACTIVE CONTEXT : ', workspaceContext)

    if (!workspaceContext) throw new WorkspaceNotFoundException(slug)

    const { workspace } = workspaceContext

    if (workspace.status !== WorkspaceStatus.ACTIVE)
      throw new WorkspaceNotActiveException(workspace.status)

    if (slug) {
      const sameSlugWorkspace = await this.workspaceRepository.findBySlug(slug)

      if (sameSlugWorkspace?.slug === slug && slug !== workspace.slug)
        throw new WorkspaceAlreadyExistsException(slug)
    }

    workspace.updateBasicInfo({ slug, name, companySize, companyType })

    if (settings) {
      workspace.updateSettings({
        defaultHoursPerDay: settings?.defaultHoursPerDay,
        defaultPointsPerMemberPerDay: settings?.defaultPointsPerMemberPerDay,
        defaultWorkingDaysPerSprint: settings?.defaultWorkingDaysPerSprint,
        defaultWorkingDaysPerWeek: settings?.defaultWorkingDaysPerWeek,
        primaryColor: settings?.primaryColor,
        logoUrl: settings?.logoUrl,
      })
    }

    await this.workspaceRepository.save(workspace)

    return {
      workspace: WorkspaceMapper.toOutputDto(workspace),
    }
  }
}
