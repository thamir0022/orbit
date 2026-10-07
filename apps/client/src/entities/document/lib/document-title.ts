import type { DocumentContent } from '@/entities/document'

const UNTITLED_DOCUMENT_TITLE = 'Untitled'

type DocumentContentNode = NonNullable<DocumentContent['content']>[number]

/**
 * Extracts plain text from a Tiptap node.
 */
function extractNodeText(node: DocumentContentNode): string {
  if (node.text) {
    return node.text
  }

  if (!node.content?.length) {
    return ''
  }

  return node.content.map(extractNodeText).join('')
}

/**
 * Derives the document title from the first paragraph.
 *
 * An empty first paragraph falls back to "Untitled".
 */
export function getDocumentTitleFromContent(content: DocumentContent): string {
  const firstTextNode = content.content?.find((node) => {
    const text = extractNodeText(node).replace(/\s+/g, ' ').trim()

    return text.length > 0
  })

  if (!firstTextNode) {
    return UNTITLED_DOCUMENT_TITLE
  }

  const title = extractNodeText(firstTextNode).replace(/\s+/g, ' ').trim()

  return title || UNTITLED_DOCUMENT_TITLE
}
