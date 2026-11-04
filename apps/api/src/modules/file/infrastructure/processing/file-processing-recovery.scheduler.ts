import { Injectable, OnModuleInit } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bullmq'
import type { Queue } from 'bullmq'
import {
  FILE_PROCESSING_QUEUE,
  FILE_RECONCILE_JOB,
} from './file-processing-queue.adapter'

/** Registers an idempotent BullMQ Job Scheduler to recover interrupted uploads. */
@Injectable()
export class FileProcessingRecoveryScheduler implements OnModuleInit {
  constructor(
    @InjectQueue(FILE_PROCESSING_QUEUE) private readonly queue: Queue
  ) {}

  async onModuleInit(): Promise<void> {
    await this.queue.upsertJobScheduler(
      'reconcile-file-uploads',
      { every: 60_000 },
      {
        name: FILE_RECONCILE_JOB,
        data: {},
        opts: {
          removeOnComplete: { count: 10 },
          removeOnFail: { count: 10 },
        },
      }
    )
  }
}
