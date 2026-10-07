import { DeleteDocumentInput } from './delete-document.input'

/**
 * Application contract for deleting a document.
 *
 * The interface remains independent of HTTP, NestJS, MongoDB,
 * Mongoose, and other infrastructure concerns.
 */
export interface IDeleteDocumentUseCase {
  execute(input: DeleteDocumentInput): Promise<void>
}

export const DELETE_DOCUMENT_USE_CASE = Symbol('DeleteDocumentUseCase')
