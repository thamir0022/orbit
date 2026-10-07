import { EMPTY_DOCUMENT_CONTENT } from '@/entities/document'
import { DocumentEditor } from '@/widgets/document'

export const NewDocumentPage = () => {
  return <DocumentEditor content={EMPTY_DOCUMENT_CONTENT} />
}
