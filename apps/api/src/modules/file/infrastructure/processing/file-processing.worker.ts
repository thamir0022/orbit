import { Injectable, Logger } from '@nestjs/common'
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq'
import type { Job } from 'bullmq'
import { ExpiredUploadCleanup } from '@/modules/file/application/services/expired-upload-cleanup.service'
import { DeletedFileCleanup } from '@/modules/file/application/services/deleted-file-cleanup.service'
import { VerifyAndScanFile } from '@/modules/file/application/use-cases/verify-and-scan-file/verify-and-scan-file.use-case'
import {
  FileProcessingQueueAdapter,
  FILE_PROCESSING_QUEUE,
  FILE_VERIFY_JOB,
  FILE_RECONCILE_JOB,
} from './file-processing-queue.adapter'
import { FileProcessingRecoveryQuery } from './file-processing-recovery.query'

/** Executes privileged processing jobs; no scanning or promotion endpoint is exposed over HTTP. */
@Injectable()
@Processor(FILE_PROCESSING_QUEUE, { concurrency: 2 })
export class FileProcessingWorker extends WorkerHost {
  private readonly logger = new Logger(FileProcessingWorker.name)

  constructor(
    private readonly verify: VerifyAndScanFile,
    private readonly recovery: FileProcessingRecoveryQuery,
    private readonly dispatch: FileProcessingQueueAdapter,
    private readonly cleanup: ExpiredUploadCleanup,
    private readonly deletedCleanup: DeletedFileCleanup
  ) {
    super()
  }

  async process(job: Job<{ fileId?: string }>): Promise<void> {
    if (job.name === FILE_VERIFY_JOB && typeof job.data.fileId === 'string') {
      await this.verify.execute(job.data.fileId)
      return
    }
    if (job.name === FILE_RECONCILE_JOB) {
      await this.cleanup.execute()
      const ids = await this.recovery.findPending()
      for (const fileId of ids) await this.dispatch.enqueueVerify(fileId)
      await this.deletedCleanup.execute()
      return
    }
    throw new Error('Unknown file processing job')
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<{ fileId?: string }> | undefined, error: Error): void {
    // Keep URLs, credentials and file contents out of logs. The retained job
    // has the failure details for an operator with access to the queue.
    this.logger.error({
      message: 'File processing job failed',
      jobId: job?.id,
      fileId: job?.data.fileId,
      attemptsMade: job?.attemptsMade,
      errorType: error.name,
    })
  }
}
