import type { DocumentContent } from './document.types'

export const EMPTY_DOCUMENT_CONTENT: DocumentContent = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
    },
  ],
}
