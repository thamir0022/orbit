export interface IBaseRepository<TEntity, TId> {
  findById(id: TId): Promise<TEntity | null>
  save(entity: TEntity): Promise<TEntity>
  delete(id: TId): Promise<void>
}
