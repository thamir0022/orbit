import { CreateDocumentInput } from './create-document.input'
import { CreateDocumentOutput } from './create-document.output'

/**
 * Application contract for creating a document.
 */
export interface ICreateDocumentUseCase {
  execute(input: CreateDocumentInput): Promise<CreateDocumentOutput>
}

export const CREATE_DOCUMENT_USE_CASE = Symbol('CreateDocumentUseCase')
