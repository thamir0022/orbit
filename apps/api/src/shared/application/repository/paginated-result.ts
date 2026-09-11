import { PaginationMeta } from '../dtos/pagination-meta.dto'

export type PaginatedResult<T> = {
  readonly data: T
  readonly meta: PaginationMeta
}
