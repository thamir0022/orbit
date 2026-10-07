/**
 * Represents the lightweight application read projection of a document.
 *
 * Contains only the fields required to identify and display a document
 * in compact document lists and navigation contexts.
 */
export interface DocumentSummaryOutput {
  readonly id: string
  readonly title: string
}
