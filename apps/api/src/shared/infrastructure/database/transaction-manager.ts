import { Injectable, Logger } from '@nestjs/common'
import { InjectConnection } from '@nestjs/mongoose'
import { Connection, ClientSession } from 'mongoose'
import { ITransactionManager } from '../../application/repository/transaction-manager.interface'

@Injectable()
export class TransactionManager implements ITransactionManager {
  private readonly _logger = new Logger(TransactionManager.name)

  constructor(@InjectConnection() private readonly connection: Connection) {}

  async executeTransaction<T>(
    operation: (session: ClientSession) => Promise<T>
  ): Promise<T> {
    const session = await this.connection.startSession()
    session.startTransaction()

    try {
      // Execute the operations, passing the session down
      const result = await operation(session)

      // If everything succeeds, commit the transaction
      await session.commitTransaction()
      return result
    } catch (error) {
      // If anything fails, abort the transaction to roll back changes
      this._logger.error(
        'Transaction failed, rolling back...',
        error instanceof Error ? error.stack : undefined
      )
      await session.abortTransaction()
      throw error
    } finally {
      // Always end the session to release it back to the connection pool
      await session.endSession()
    }
  }
}
