import { Injectable } from '@nestjs/common'
import { Processor, WorkerHost } from '@nestjs/bullmq'
import type { Job } from 'bullmq'
import { ExpiredUploadCleanup } from '@/modules/file/application/services/expired-upload-cleanup.service'
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
  constructor(
    private readonly verify: VerifyAndScanFile,
    private readonly recovery: FileProcessingRecoveryQuery,
    private readonly dispatch: FileProcessingQueueAdapter,
    private readonly cleanup: ExpiredUploadCleanup
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
      return
    }
    throw new Error('Unknown file processing job')
  }
}
