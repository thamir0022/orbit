import {
  ActiveWorkspaceContext,
  FindActiveContextBySlugParams,
  FindActiveContextParams,
  FindUserWorkspacesParams,
  FindWorkspaceQuery,
  IWorkspaceRepository,
} from '@/modules/workspace/application'
import { Workspace, WorkspaceStatus } from '@/modules/workspace/domain'
import { WorkspaceId } from '@/modules/workspace/domain'
import { InjectModel } from '@nestjs/mongoose'
import { Model, QueryFilter } from 'mongoose'
import { WorkspaceDocument, WorkspaceModel } from '../schema/workspace.schema'
import { WorkspaceMapper } from '@/modules/workspace/application/mappers/workspace.mapper'
import { Logger } from '@nestjs/common'
import {
  WorkspaceMemberDocument,
  WorkspaceMemberModel,
} from '../schema/workspace-member.schema'
import { UserId } from '@/modules/user/domain'
import { WorkspaceListItem } from '@/modules/workspace/application/model/workspaces-list'
import { PaginatedResult } from '@/shared/application'

export class WorkspaceRepository implements IWorkspaceRepository {
  private readonly logger = new Logger(WorkspaceRepository.name)
  constructor(
    @InjectModel(WorkspaceModel.name)
    private readonly workspaceModel: Model<WorkspaceDocument>,
    @InjectModel(WorkspaceMemberModel.name)
    private readonly memberModel: Model<WorkspaceMemberDocument>
  ) {}

  async findById(id: WorkspaceId): Promise<Workspace | null> {
    const document = await this.workspaceModel.findOne({
      id: id.value,
      deletedAt: null,
    })

    if (!document) return null

    return WorkspaceMapper.toDomain(document)
  }

  async findByUserId({
    userId,
  }: FindUserWorkspacesParams): Promise<WorkspaceListItem[]> {
    // 1. Find all memberships for this user
    const memberships = await this.memberModel.find({ userId }).lean().exec()

    if (!memberships.length) return []

    // 2. Extract the workspace IDs
    const workspaceIds = memberships.map((m) => m.workspaceId)

    // 3. Fetch the workspaces in a single query
    const workspaces = await this.workspaceModel
      .find({
        id: { $in: workspaceIds },
        status: WorkspaceStatus.ACTIVE,
      })
      .lean()
      .exec()

    // 4. Map directly to the Read Model Contract
    return workspaces.map((workspace) => ({
      name: workspace.name,
      slug: workspace.slug,
      logoUrl: workspace.settings?.logoUrl,
    }))
  }

  /**
   * Platform Admin Query: Fetches all workspaces globally with pagination.
   */
  async findAll({
    page,
    limit,
    search,
    status,
  }: FindWorkspaceQuery): Promise<PaginatedResult<Workspace[] | []>> {
    const skip = (page - 1) * limit

    const filter: QueryFilter<WorkspaceDocument> = {}

    if (status) filter.status = status

    if (search?.trim()) {
      const keyword = search.trim()

      filter.$or = [
        {
          name: {
            $regex: keyword,
            $options: 'i',
          },
        },
        {
          slug: {
            $regex: keyword,
            $options: 'i',
          },
        },
      ]
    }

    const [data, total] = await Promise.all([
      this.workspaceModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.workspaceModel.countDocuments(),
    ])

    return {
      data: data.map((workspace) => WorkspaceMapper.toDomain(workspace)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findActiveContext({
    workspaceId,
    userId,
  }: FindActiveContextParams): Promise<ActiveWorkspaceContext | null> {
    // 1. Verify Membership First
    const membership = await this.memberModel
      .findOne({ workspaceId, userId })
      .lean()
      .exec()

    if (!membership) {
      return null
    }

    // 2. Fetch the actual Workspace
    const workspaceDoc = await this.workspaceModel
      .findOne({ id: workspaceId, status: WorkspaceStatus.ACTIVE })
      .lean()
      .exec()

    if (!workspaceDoc) {
      return null
    }

    return {
      workspace: WorkspaceMapper.toDomain(workspaceDoc), // 3. Map to Domain Entity
      roleId: membership.roleId,
    }
  }

  async findActiveContextBySlug({
    slug,
    userId,
  }: FindActiveContextBySlugParams): Promise<ActiveWorkspaceContext | null> {
    // 1. Resolve the Workspace via Slug (Fast: Uses the unique slug_idx)
    // We strictly enforce status: 'ACTIVE' so suspended workspaces act as if they don't exist
    const workspaceDoc = await this.workspaceModel
      .findOne({ slug, status: WorkspaceStatus.ACTIVE })
      .lean()
      .exec()

    this.logger.debug('workspace', workspaceDoc)

    // 🚨 Security: Return null immediately. Do not reveal if the slug exists but is suspended.
    if (!workspaceDoc) {
      return null
    }

    // 2. Verify Membership using the resolved Workspace ID (Fast: Uses composite index)
    const membership = await this.memberModel
      .findOne({
        workspaceId: workspaceDoc.id, // Maps to the internal tenant ID
        userId: userId.value,
      })
      .lean()
      .exec()

    this.logger.debug('user data : ', { slug, userId })
    this.logger.debug('MEMBERSHIP : ', membership)

    // 🚨 Security: If they aren't a member, act like it doesn't exist.
    if (!membership) {
      return null
    }

    // 3. Map to Domain Entity

    return {
      workspace: WorkspaceMapper.toDomain(workspaceDoc),
      roleId: membership.roleId,
    }
  }

  async save(org: Workspace): Promise<void> {
    const persistenceData = WorkspaceMapper.toPersistence(org)

    const existingOrg = await this.workspaceModel.findOne({
      id: org.id.value,
    })

    if (existingOrg) {
      await this.workspaceModel.updateOne(
        { id: org.id.value },
        { $set: persistenceData }
      )
      this.logger.debug(`Updated workspace: ${org.id.value}`)
    } else {
      const newOrg = new this.workspaceModel(persistenceData)
      await newOrg.save()
      this.logger.debug(`Created workspace: ${org.id.value}`)
    }
  }

  async findBySlug(slug: string): Promise<Workspace | null> {
    const document = await this.workspaceModel.findOne({
      slug,
      deletedAt: null,
    })

    if (!document) return null

    return WorkspaceMapper.toDomain(document)
  }

  async isMember(workspaceId: WorkspaceId, userId: UserId): Promise<boolean> {
    const member = await this.memberModel.findOne({
      workspaceId: workspaceId.value,
      userId: userId.value,
    })

    return member !== null
  }

  async delete(id: WorkspaceId): Promise<void> {
    await this.workspaceModel.findOneAndDelete({
      id: id.value,
      deletedAt: new Date(),
    })
  }
}
