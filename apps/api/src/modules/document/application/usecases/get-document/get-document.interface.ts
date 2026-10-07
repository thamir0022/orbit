import { GetDocumentInput } from './get-document.input'
import { GetDocumentOutput } from './get-document.output'

/**
 * Application contract for retrieving a private document.
 *
 * The interface remains independent of HTTP, NestJS, MongoDB, and
 * other infrastructure concerns.
 */
export interface IGetDocumentUseCase {
  execute(input: GetDocumentInput): Promise<GetDocumentOutput>
}

export const GET_DOCUMENT_USE_CASE = Symbol('GetDocumentUseCase')
