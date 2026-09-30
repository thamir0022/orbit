import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { ITransactionOptions } from '@/shared/application'
import { ProjectId } from '@/modules/project/domain'
import { WorkItemCounterRepository } from '../../../../application/ports/work-item-counter-repository.port'
import {
  WorkItemCounterDocument,
  WorkItemCounterModel,
} from '../../../../infrastructure/persistance/mongoose/schemas/work-item-counter.schema'

export class MongoWorkItemCounterRepository implements WorkItemCounterRepository {
  constructor(
    @InjectModel(WorkItemCounterModel.name)
    private readonly counterModel: Model<WorkItemCounterDocument>
  ) {}

  async nextNumber(
    projectId: ProjectId,
    options?: ITransactionOptions
  ): Promise<number> {
    const now = new Date()

    const query = this.counterModel.findOneAndUpdate(
      {
        projectId: projectId.value,
      },
      {
        $inc: {
          currentNumber: 1,
        },
        $set: {
          updatedAt: now,
        },
        $setOnInsert: {
          projectId: projectId.value,
          currentNumber: 0,
          createdAt: now,
        },
      },
      {
        upsert: true,
        new: true,
        returnDocument: 'after',
      }
    )

    if (options?.session) {
      query.session(options.session)
    }

    const counter = await query.exec()

    if (!counter) {
      throw new Error('Failed to allocate work item number')
    }

    return counter.currentNumber
  }
}
