import { RepositoryConflictError } from '../ports/repositories/repository-snapshot'

/** Retries short, Mongo-only CAS transactions; never wrap cloud or queue operations. */
export async function retryRepositoryConflict<T>(
  work: () => Promise<T>,
  attempts = 3
): Promise<T> {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await work()
    } catch (error: unknown) {
      if (
        !(error instanceof RepositoryConflictError) ||
        attempt === attempts - 1
      )
        throw error
    }
  }
  throw new Error('Unreachable repository retry state')
}
