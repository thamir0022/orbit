/** Public processing progress without exposing queue internals or error details. */
export type FileProcessingStatus =
  'queued' | 'processing' | 'retrying' | 'failed'

export interface FileProcessingStatusPort {
  getStatus(fileId: string): Promise<FileProcessingStatus | null>
}

export const FILE_PROCESSING_STATUS = Symbol('IFileProcessingStatus')
