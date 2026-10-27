import { InjectModel } from '@nestjs/mongoose'
import { WorkItemNumberAllocator } from '@/modules/workitem/application/ports/work-item-number-allocator.port'
import {
  TeamWorkItemCounterModel,
  TeamWorkItemCounterDocument,
} from '../schemas/work-item-counter.schema'
import { Model } from 'mongoose'
import { ITransactionOptions } from '@/shared/application'
import { WorkspaceId } from '@/modules/workspace/domain'
import { TeamId } from '@/modules/team/domain'

export class MongoWorkItemNumberAllocator implements WorkItemNumberAllocator {
  constructor(
    @InjectModel(TeamWorkItemCounterModel.name)
    private readonly counterModel: Model<TeamWorkItemCounterDocument>
  ) {}

  async allocateNextNumber(
    workspaceId: WorkspaceId,
    teamId: TeamId,
    options?: ITransactionOptions
  ): Promise<number> {
    const counter = await this.counterModel
      .findOneAndUpdate(
        {
          workspaceId: workspaceId.value,
          teamId: teamId.value,
        },
        {
          $inc: { lastIssuedNumber: 1 },
        },
        {
          returnDocument: 'after',
          upsert: true,
          setDefaultsOnInsert: false,
          session: options?.session,
          projection: { lastIssuedNumber: 1 },
        }
      )
      .lean()
      .exec()

    if (!counter) {
      throw new Error('Failed to allocate the next Work Item number.')
    }

    return counter.lastIssuedNumber
  }
}
