import { Inject, Injectable } from '@nestjs/common'
import { ClientSession } from 'mongoose'
import { ITransactionManager, TRANSACTION_MANAGER } from '@/shared/application'
import { SprintConflictException } from '../../domain/exceptions/sprint-conflict.exception'

/** Translates aborted concurrent sprint transactions into recoverable conflicts. */

@Injectable()
export class SprintTransactionManager implements ITransactionManager {
  constructor(
    @Inject(TRANSACTION_MANAGER)
    private readonly transactions: ITransactionManager
  ) {}
  // Only known aborted write conflicts are reported as safe to retry.
  async executeTransaction<T>(
    operation: (session: ClientSession) => Promise<T>
  ): Promise<T> {
    try {
      return await this.transactions.executeTransaction(operation)
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 112
      )
        throw new SprintConflictException()
      throw error
    }
  }
}
