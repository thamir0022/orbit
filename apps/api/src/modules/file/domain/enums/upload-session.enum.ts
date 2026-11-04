/** Lifecycle of one direct browser upload. */
export enum UploadSessionStatus {
  INITIATED = 'initiated',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
  ABORTED = 'aborted',
}
