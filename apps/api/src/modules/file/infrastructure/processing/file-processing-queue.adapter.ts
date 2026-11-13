import { Injectable } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bullmq'
import type { Queue } from 'bullmq'

import type { FileProcessingDispatchPort } from '@/modules/file/application/ports/file-processing-dispatch.port'
import type {
  FileProcessingStatus,
  FileProcessingStatusPort,
} from '@/modules/file/application/ports/file-processing-status.port'

export const FILE_PROCESSING_QUEUE = 'file-processing'
export const FILE_VERIFY_JOB = 'file-verify'
export const FILE_RECONCILE_JOB = 'file-reconcile'

/** Dispatches file verification jobs to BullMQ. */
@Injectable()
export class FileProcessingQueueAdapter
  implements FileProcessingDispatchPort, FileProcessingStatusPort
{
  constructor(
    @InjectQueue(FILE_PROCESSING_QUEUE)
    private readonly queue: Queue
  ) {}

  async getStatus(fileId: string): Promise<FileProcessingStatus | null> {
    const job = await this.queue.getJob(`verify-${fileId}`)
    if (!job) return null
    const state = await job.getState()
    if (state === 'failed') return 'failed'
    if (state === 'completed' || state === 'unknown') return null
    if (job.attemptsMade > 0 && job.failedReason) return 'retrying'
    return state === 'active' ? 'processing' : 'queued'
  }

  async enqueueVerify(fileId: string): Promise<void> {
    const job = await this.queue.add(
      FILE_VERIFY_JOB,
      { fileId },
      {
        jobId: `verify-${fileId}`,
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 5_000,
        },
        removeOnComplete: {
          count: 100,
        },
        removeOnFail: {
          count: 100,
        },
      }
    )
    // Retained terminal jobs still own their ID. Adding that ID alone is a
    // no-op, so explicitly redrive it after an outage or interrupted dispatch.
    const state = await job.getState()
    if (state === 'failed' || state === 'completed') {
      try {
        await job.retry(state, { resetAttemptsMade: true })
      } catch (error: unknown) {
        // Another API instance/reconciler may already have retried this job.
        const latest = await job.getState()
        if (
          latest === 'failed' ||
          latest === 'completed' ||
          latest === 'unknown'
        ) {
          throw error
        }
      }
    }
  }
}
