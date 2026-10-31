import type { GetUnreadCountInput } from './get-unread-count.input'

/** Response containing the recipient's unread notification count. */
export interface GetUnreadCountOutput {
  readonly count: number
}

/** Application contract for retrieving unread notification counts. */
export interface IGetUnreadCountUseCase {
  execute(input: GetUnreadCountInput): Promise<GetUnreadCountOutput>
}

/** Injection token for the unread notification count use case. */
export const GET_UNREAD_COUNT_USE_CASE = Symbol('GetUnreadCountUseCase')
