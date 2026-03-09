import { ITransactionOptions } from '../repository/transaction-manager.interface'

export interface IBaseRepository<TEntity, TId> {
  findById(id: TId): Promise<TEntity | null>
  save(entity: TEntity, options?: ITransactionOptions): Promise<void>
  delete(id: TId, options?: ITransactionOptions): Promise<void>
}
