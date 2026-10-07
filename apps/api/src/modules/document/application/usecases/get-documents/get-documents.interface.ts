import { GetDocumentsInput } from './get-documents.input'
import { GetDocumentsOutput } from './get-documents.output'

/**
 * Application contract for retrieving the user's active documents.
 *
 * The interface remains independent of HTTP, NestJS, MongoDB,
 * Mongoose, and other infrastructure concerns.
 */
export interface IGetDocumentsUseCase {
  execute(input: GetDocumentsInput): Promise<GetDocumentsOutput>
}

export const GET_DOCUMENTS_USE_CASE = Symbol('GetDocumentsUseCase')
