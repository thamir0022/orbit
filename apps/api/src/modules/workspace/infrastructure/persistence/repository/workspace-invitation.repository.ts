import { IWorkspaceInvitationRepository } from '@/modules/workspace/application/repository/workspace-invitation.repository.interface'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import {
  WorkspaceInvitationDocument,
  WorkspaceInvitationModel,
} from '../schema/workspace-invitation.schema'
import { Model } from 'mongoose'
import {
  WorkspaceId,
  WorkspaceInvitationId,
  WorkspaceInvitationStatus,
} from '@/modules/workspace/domain'
import { WorkspaceInvitation } from '@/modules/workspace/domain/entities/workspace-invitation.entity'
import { WorkspaceInvitationMapper } from '@/modules/workspace/application/mappers/workspace-invitation.mapper'
import { type ITransactionOptions } from '@/shared/application'
import { Email } from '@/modules/user/domain'

@Injectable()
export class MongoWorkspaceInvitationRepository implements IWorkspaceInvitationRepository {
  constructor(
    @InjectModel(WorkspaceInvitationModel.name)
    private readonly model: Model<WorkspaceInvitationDocument>
  ) {}

  async findById(
    id: WorkspaceInvitationId
  ): Promise<WorkspaceInvitation | null> {
    const document = await this.model.findOne({ id: id.value }).exec()

    return document ? WorkspaceInvitationMapper.toDomain(document) : null
  }

  async save(
    invitation: WorkspaceInvitation,
    options?: ITransactionOptions
  ): Promise<void> {
    await this.model
      .findOneAndUpdate(
        {
          id: invitation.id.value,
        },
        WorkspaceInvitationMapper.toPersistence(invitation),
        {
          upsert: true,
          session: options?.session,
        }
      )
      .exec()
  }

  async delete(
    id: WorkspaceInvitationId,
    options?: ITransactionOptions
  ): Promise<void> {
    await this.model
      .deleteOne(
        { id: id.value },
        {
          session: options?.session,
        }
      )
      .exec()
  }

  async findByTokenHash(
    tokenHash: string
  ): Promise<WorkspaceInvitation | null> {
    const document = await this.model.findOne({ tokenHash }).exec()

    return document ? WorkspaceInvitationMapper.toDomain(document) : null
  }

  async findPendingByEmail(
    workspaceId: WorkspaceId,
    email: Email
  ): Promise<WorkspaceInvitation | null> {
    const document = await this.model
      .findOne({
        workspaceId: workspaceId.value,
        email: email.value,
        status: WorkspaceInvitationStatus.PENDING,
      })
      .exec()

    return document ? WorkspaceInvitationMapper.toDomain(document) : null
  }

  async existsPendingInvitation(
    workspaceId: WorkspaceId,
    email: Email
  ): Promise<boolean> {
    const exists = await this.model
      .exists({
        workspaceId: workspaceId.value,
        email: email.value,
        status: WorkspaceInvitationStatus.PENDING,
      })
      .exec()

    return !!exists
  }

  async revokeExpiredInvitations(): Promise<number> {
    const result = await this.model.updateMany(
      {
        status: WorkspaceInvitationStatus.PENDING,
        expiresAt: {
          $lt: new Date(),
        },
      },
      {
        $set: {
          status: WorkspaceInvitationStatus.REVOKED,
        },
      }
    )

    return result.modifiedCount
  }
}
