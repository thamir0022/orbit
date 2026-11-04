/** Durable background delivery of an already committed upload. */
export interface FileProcessingDispatchPort {
  enqueueVerify(fileId: string): Promise<void>
}

export const FILE_PROCESSING_DISPATCH = Symbol('IFileProcessingDispatch')
