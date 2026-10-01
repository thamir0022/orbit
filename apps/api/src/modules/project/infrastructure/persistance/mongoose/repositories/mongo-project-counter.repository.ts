import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { ITransactionOptions } from '@/shared/application'
import { WorkspaceId } from '@/modules/workspace/domain'

import {
  ProjectCounterDocument,
  ProjectCounterModel,
} from '../schemas/project-counter.schema'
import { ProjectCounterRepository } from '../../../../application/ports/project-counter-repository.port'

export class MongoProjectCounterRepository implements ProjectCounterRepository {
  constructor(
    @InjectModel(ProjectCounterModel.name)
    private readonly counterModel: Model<ProjectCounterDocument>
  ) {}

  async nextNumber(
    workspaceId: WorkspaceId,
    options?: ITransactionOptions
  ): Promise<number> {
    const now = new Date()

    const query = this.counterModel.findOneAndUpdate(
      {
        workspaceId: workspaceId.value,
      },
      {
        $inc: {
          currentNumber: 1,
        },

        $set: {
          updatedAt: now,
        },

        $setOnInsert: {
          workspaceId: workspaceId.value,
          createdAt: now,
        },
      },
      {
        upsert: true,
        returnDocument: 'after',
        setDefaultsOnInsert: true,
        runValidators: true,
      }
    )

    if (options?.session) {
      query.session(options.session)
    }

    const counter = await query.exec()

    if (!counter) {
      throw new Error('Failed to allocate project number')
    }

    return counter.currentNumber
  }
}
