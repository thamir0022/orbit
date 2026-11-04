/** An aggregate and the persistence revision used for optimistic concurrency. */
export interface RepositorySnapshot<T> {
  readonly entity: T
  readonly revision: number
}

/** Expected-revision conflicts are retried at the application boundary when safe. */
export class RepositoryConflictError extends Error {
  constructor(message = 'The resource has changed since it was loaded') {
    super(message)
    this.name = 'RepositoryConflictError'
  }
}
