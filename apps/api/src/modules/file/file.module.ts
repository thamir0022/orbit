import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'

import {
  FILE_CONFIG,
  type IFileConfig,
} from './application/ports/file-config.port'
import { FILE_AUTHORIZATION } from './application/ports/file-authorization.port'
import { FILE_UPLOAD_POLICY } from './application/ports/file-upload-policy.port'
import { FILE_CONTENT_INSPECTOR } from './application/ports/file-content-inspector.port'
import { FILE_SECURITY_SCANNER } from './application/ports/file-security-scanner.port'
import { FILE_PROCESSING_DISPATCH } from './application/ports/file-processing-dispatch.port'
import { FILE_PROCESSING_STATUS } from './application/ports/file-processing-status.port'
import {
  OBJECT_STORAGE,
  type ObjectStoragePort,
} from './application/ports/object-storage.port'

import { DefaultFileUploadPolicy } from './application/policies/default-file-upload-policy'

import { InitiateUpload } from './application/use-cases/initiate-upload/initiate-upload.use-case'
import { CompleteUpload } from './application/use-cases/complete-upload/complete-upload.use-case'
import { GetUploadStatus } from './application/use-cases/get-upload-status/get-upload-status.use-case'
import { VerifyAndScanFile } from './application/use-cases/verify-and-scan-file/verify-and-scan-file.use-case'
import { PromoteFile } from './application/use-cases/promote-file/promote-file.use-case'
import { GetAuthorizedAccess } from './application/use-cases/get-authorized-access/get-authorized-access.use-case'
import { AttachFile } from './application/use-cases/attach-file/attach-file.use-case'
import { ListAttachments } from './application/use-cases/list-attachments/list-attachments.use-case'
import { RemoveAttachment } from './application/use-cases/remove-attachment/remove-attachment.use-case'
import { UpdateAttachment } from './application/use-cases/update-attachment/update-attachment.use-case'
import { ReorderAttachments } from './application/use-cases/reorder-attachments/reorder-attachments.use-case'
import { ExpiredUploadCleanup } from './application/services/expired-upload-cleanup.service'
import { DeletedFileCleanup } from './application/services/deleted-file-cleanup.service'

import { WorkspaceModule } from '@/modules/workspace/workspace.module'
import { ProjectModule } from '@/modules/project/project.module'
import { WorkItemModule } from '@/modules/workitem/work-item.module'

import { FileInfrastructureModule } from './infrastructure/file-infrastructure.module'
import { OrbitFileAuthorizationAdapter } from './infrastructure/authorization/orbit-file-authorization.adapter'

import {
  FileProcessingQueueAdapter,
  FILE_PROCESSING_QUEUE,
} from './infrastructure/processing/file-processing-queue.adapter'
import { FileProcessingRecoveryScheduler } from './infrastructure/processing/file-processing-recovery.scheduler'
import { FileProcessingWorker } from './infrastructure/processing/file-processing.worker'
import { ClamAvFileSecurityScanner } from './infrastructure/processing/clamav-file-security-scanner.adapter'
import { StreamingFileContentInspector } from './infrastructure/processing/streaming-file-content-inspector.adapter'

import { FileUploadController } from './presentation/http/controllers/file-upload.controller'
import { FileAccessController } from './presentation/http/controllers/file-access.controller'
import { FileAttachmentController } from './presentation/http/controllers/file-attachment.controller'

/**
 * File bounded context.
 *
 * Composes application use cases, infrastructure adapters,
 * background processing and business authorization.
 */
@Module({
  imports: [
    FileInfrastructureModule,
    WorkspaceModule,
    ProjectModule,
    WorkItemModule,
    BullModule.registerQueue({
      name: FILE_PROCESSING_QUEUE,
    }),
  ],
  controllers: [
    FileUploadController,
    FileAccessController,
    FileAttachmentController,
  ],
  providers: [
    // Application use cases
    InitiateUpload,
    CompleteUpload,
    GetUploadStatus,
    VerifyAndScanFile,
    PromoteFile,
    GetAuthorizedAccess,
    AttachFile,
    ListAttachments,
    RemoveAttachment,
    UpdateAttachment,
    ReorderAttachments,

    // Business authorization
    {
      provide: FILE_AUTHORIZATION,
      useClass: OrbitFileAuthorizationAdapter,
    },

    // Upload policy
    {
      provide: FILE_UPLOAD_POLICY,
      inject: [FILE_CONFIG],
      useFactory: (config: IFileConfig) =>
        new DefaultFileUploadPolicy(
          config.workspaceQuotaBytes,
          config.userQuotaBytes
        ),
    },

    // File inspection
    StreamingFileContentInspector,
    {
      provide: FILE_CONTENT_INSPECTOR,
      useExisting: StreamingFileContentInspector,
    },

    // Security scanning
    {
      provide: FILE_SECURITY_SCANNER,
      inject: [OBJECT_STORAGE, FILE_CONFIG],
      useFactory: (storage: ObjectStoragePort, config: IFileConfig) =>
        new ClamAvFileSecurityScanner(
          storage,
          config.clamAvHost,
          config.clamAvPort,
          110 * 1024 ** 2,
          config.clamAvTimeoutMs
        ),
    },

    // Background processing
    FileProcessingQueueAdapter,
    {
      provide: FILE_PROCESSING_DISPATCH,
      useExisting: FileProcessingQueueAdapter,
    },
    {
      provide: FILE_PROCESSING_STATUS,
      useExisting: FileProcessingQueueAdapter,
    },
    ExpiredUploadCleanup,
    DeletedFileCleanup,
    FileProcessingRecoveryScheduler,
    FileProcessingWorker,
  ],
  exports: [
    InitiateUpload,
    CompleteUpload,
    GetUploadStatus,
    GetAuthorizedAccess,
    AttachFile,
    ListAttachments,
    RemoveAttachment,
  ],
})
export class FileModule {}
