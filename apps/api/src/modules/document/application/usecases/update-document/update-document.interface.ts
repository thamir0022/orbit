import { UpdateDocumentInput } from './update-document.input'
import { UpdateDocumentOutput } from './update-document.output'

/**
 * Application contract for updating an existing document.
 *
 * The interface remains independent of HTTP, NestJS, MongoDB,
 * Mongoose, and other infrastructure concerns.
 */
export interface IUpdateDocumentUseCase {
  execute(input: UpdateDocumentInput): Promise<UpdateDocumentOutput>
}

export const UPDATE_DOCUMENT_USE_CASE = Symbol('UpdateDocumentUseCase')
