import type { Queue } from 'bullmq'
import { FileProcessingQueueAdapter } from './file-processing-queue.adapter'

describe('File processing recovery', () => {
  const job = {
    getState: jest.fn(),
    retry: jest.fn(),
    attemptsMade: 0,
    failedReason: '',
  }
  const queue = { add: jest.fn(), getJob: jest.fn() }
  const dispatch = new FileProcessingQueueAdapter(queue as unknown as Queue)

  beforeEach(() => {
    jest.resetAllMocks()
    queue.add.mockResolvedValue(job)
    queue.getJob.mockResolvedValue(job)
    job.attemptsMade = 0
    job.failedReason = ''
    job.retry.mockResolvedValue(undefined)
  })

  it.each([
    ['waiting', 'queued'],
    ['active', 'processing'],
    ['failed', 'failed'],
    ['completed', null],
  ])('reports %s progress as %s', async (state, status) => {
    job.getState.mockResolvedValue(state)
    await expect(dispatch.getStatus('file-id')).resolves.toBe(status)
  })

  it('reports retrying while scanner failures are delayed without leaking errors', async () => {
    job.getState.mockResolvedValue('delayed')
    job.attemptsMade = 1
    job.failedReason = 'connect ECONNREFUSED 127.0.0.1:3310'
    await expect(dispatch.getStatus('file-id')).resolves.toBe('retrying')
  })

  it('does not invent a failure for a missing job', async () => {
    queue.getJob.mockResolvedValue(undefined)
    await expect(dispatch.getStatus('file-id')).resolves.toBeNull()
  })

  it.each(['failed', 'completed'])(
    'redrives a retained %s job with a fresh retry budget',
    async (state) => {
      job.getState.mockResolvedValue(state)
      await dispatch.enqueueVerify('file-id')
      expect(job.retry).toHaveBeenCalledWith(state, { resetAttemptsMade: true })
    }
  )

  it.each(['active', 'waiting', 'delayed'])(
    'does not disturb a job that is already %s',
    async (state) => {
      job.getState.mockResolvedValue(state)
      await dispatch.enqueueVerify('file-id')
      expect(job.retry).not.toHaveBeenCalled()
    }
  )

  it('accepts another reconciler winning the retry race', async () => {
    job.getState
      .mockResolvedValueOnce('failed')
      .mockResolvedValueOnce('waiting')
    job.retry.mockRejectedValue(new Error('Job is no longer failed'))
    await expect(dispatch.enqueueVerify('file-id')).resolves.toBeUndefined()
  })

  it('does not hide a failure to redrive a terminal job', async () => {
    job.getState.mockResolvedValue('failed')
    job.retry.mockRejectedValue(new Error('Retry unavailable'))
    await expect(dispatch.enqueueVerify('file-id')).rejects.toThrow(
      'Retry unavailable'
    )
  })
})
