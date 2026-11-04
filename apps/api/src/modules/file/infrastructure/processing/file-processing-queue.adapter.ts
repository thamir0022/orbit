import { Injectable } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bullmq'
import type { Queue } from 'bullmq'
import type { FileProcessingDispatchPort } from '@/modules/file/application/ports/file-processing-dispatch.port'

/** Shared queue name for scheduled, idempotent verification jobs. */
export const FILE_PROCESSING_QUEUE = 'file-processing'
export const FILE_VERIFY_JOB = 'file-verify'
export const FILE_RECONCILE_JOB = 'file-reconcile'

/** Persists verification work in BullMQ; Redis connection is configured by Orbit's root module. */
@Injectable()
export class FileProcessingQueueAdapter implements FileProcessingDispatchPort {
  constructor(
    @InjectQueue(FILE_PROCESSING_QUEUE) private readonly queue: Queue
  ) {}

  async enqueueVerify(fileId: string): Promise<void> {
    await this.queue.add(
      FILE_VERIFY_JOB,
      { fileId },
      {
        jobId: `verify-${fileId}`,
        attempts: 8,
        backoff: { type: 'exponential', delay: 15_000 },
        removeOnComplete: true,
        removeOnFail: true,
      }
    )
  }
}
