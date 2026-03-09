import { ClientSession } from 'mongoose'

export interface ITransactionOptions {
  session?: ClientSession // Kept generic to avoid leaking Mongoose types into the Application layer
}

export interface ITransactionManager {
  /**
   * Executes a block of code within a database transaction.
   * @param operation The operations to perform inside the transaction
   */
  executeTransaction<T>(
    operation: (session: ClientSession) => Promise<T>
  ): Promise<T>
}

export const TRANSACTION_MANAGER = Symbol('TRANSACTION_MANAGER')
