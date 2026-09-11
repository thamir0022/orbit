import {
  WorkspaceMemberModel,
  WorkspaceMemberDocument,
} from '../schema/workspace-member.schema'
import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, PipelineStage } from 'mongoose'
import { UUID } from 'mongodb'
import {
  ExistsWorkspaceMemberQuery,
  FindMemberQuery,
  FindWorkspaceMembersQuery,
  IWorkspaceMemberRepository,
} from '@/modules/workspace/application/repository/workspace-member.repository.interface'
import { WorkspaceMember } from '@/modules/workspace/domain/entities/workspace-member.entity'
import { WorkspaceMemberMapper } from '@/modules/workspace/application/mappers/workspace-member.mapper'
import { ITransactionOptions } from '@/shared/application/ports/transaction-manager.interface'
import { WorkspaceMemberDto } from '@/modules/workspace/application/model/workspace-member'
import { PaginatedResult } from '@/shared/application'
import { RoleId } from '@/modules/authorization/domain/value-objects/role-id.vo'

@Injectable()
export class WorkspaceMemberRepository implements IWorkspaceMemberRepository {
  private readonly logger = new Logger(WorkspaceMemberRepository.name)

  constructor(
    @InjectModel(WorkspaceMemberModel.name)
    private readonly memberModel: Model<WorkspaceMemberDocument>
  ) {}

  async findById(id: string): Promise<WorkspaceMember | null> {
    return this.memberModel.findOne({ id })
  }

  async findMember(query: FindMemberQuery): Promise<WorkspaceMemberDto | null> {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          workspaceId: new UUID(query.workspaceId.value),
          userId: new UUID(query.memberId.value),
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: 'id',
          as: 'user',
        },
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'roles',
          localField: 'roleId',
          foreignField: 'id',
          as: 'role',
        },
      },
      {
        $unwind: {
          path: '$role',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,

          id: 1,
          userId: 1,

          displayName: '$user.displayName',
          email: '$user.email',
          avatarUrl: '$user.avatarUrl',

          roleId: '$role.id',
          roleName: '$role.name',

          status: 1,
          joinedAt: 1,
        },
      },
      {
        // Limits the pipeline processing to just 1 document for efficiency
        $limit: 1,
      },
    ]

    // Destructure the first element from the aggregation array
    const [result] =
      await this.memberModel.aggregate<WorkspaceMemberDto>(pipeline)

    // Return the result if it exists, otherwise return null
    return result ?? null
  }

  async findAll({
    workspaceId,
    page,
    limit,
    search,
    roleId,
    status,
  }: FindWorkspaceMembersQuery): Promise<
    PaginatedResult<WorkspaceMemberDto[]>
  > {
    const skip = (page - 1) * limit

    const match: Record<string, unknown> = {
      workspaceId: new UUID(workspaceId),
    }

    if (status) match.status = status

    if (roleId) match.roleId = roleId

    const keyword = search?.trim()

    const pipeline: PipelineStage[] = [
      {
        $match: match,
      },

      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: 'id',
          as: 'user',
        },
      },

      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $lookup: {
          from: 'roles',
          localField: 'roleId',
          foreignField: 'id',
          as: 'role',
        },
      },

      {
        $unwind: {
          path: '$role',
          preserveNullAndEmptyArrays: true,
        },
      },
    ]

    if (keyword) {
      pipeline.push({
        $match: {
          $or: [
            {
              'user.firstName': {
                $regex: keyword,
                $options: 'i',
              },
            },
            {
              'user.lastName': {
                $regex: keyword,
                $options: 'i',
              },
            },
            {
              'user.displayName': {
                $regex: keyword,
                $options: 'i',
              },
            },
            {
              'user.email': {
                $regex: keyword,
                $options: 'i',
              },
            },
          ],
        },
      })
    }

    pipeline.push({
      $facet: {
        data: [
          {
            $sort: {
              joinedAt: -1,
            },
          },
          {
            $skip: skip,
          },
          {
            $limit: limit,
          },
          {
            $project: {
              _id: 0,

              id: 1,
              userId: 1,

              displayName: '$user.displayName',
              email: '$user.email',
              avatarUrl: '$user.avatarUrl',

              roleId: '$role.id',
              roleName: '$role.name',

              status: 1,
              joinedAt: 1,
            },
          },
        ],

        total: [
          {
            $count: 'count',
          },
        ],
      },
    })

    const [result] = await this.memberModel.aggregate<{
      data: WorkspaceMemberDto[]
      total: { count: number }[]
    }>(pipeline)

    const total = result?.total?.[0]?.count ?? 0

    this.logger.debug(result, total)

    return {
      data: result?.data ?? [],
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async delete(id: string, options?: ITransactionOptions): Promise<void> {
    await this.memberModel.deleteOne({ id }, { session: options?.session })
  }

  async save(
    member: WorkspaceMember,
    options?: ITransactionOptions
  ): Promise<void> {
    const persistenceData = WorkspaceMemberMapper.toPersistence(member)

    // Upsert logic: if it exists, update it; if not, create it.
    // This safely handles both new entity creation and domain behavior updates.
    await this.memberModel
      .updateOne(
        {
          workspaceId: persistenceData.workspaceId,
          userId: persistenceData.userId,
        },
        { $set: persistenceData },
        { upsert: true, session: options?.session }
      )
      .exec()
  }

  async exists({
    workspaceId,
    email,
    userId,
  }: ExistsWorkspaceMemberQuery): Promise<boolean> {
    if (!userId && !email)
      throw new Error(
        'Either userId or email is required to check member existence.'
      )

    const filter: Record<string, string> = {
      workspaceId: workspaceId.value,
    }

    if (userId) filter.userId = userId.value
    if (email) filter.email = email.value

    const doc = await this.memberModel.exists(filter).exec()

    return !!doc
  }

  async replaceRole(
    oldRoleId: RoleId,
    newRoleId: RoleId,
    options?: ITransactionOptions
  ): Promise<void> {
    await this.memberModel.updateMany(
      {
        roleId: oldRoleId.value,
      },
      { $set: { roleId: newRoleId.value } },
      { session: options?.session }
    )
  }
}
