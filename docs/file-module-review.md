# File module review — 2026-11-12

Scope: API file domain, application, persistence, storage, authorization and workers; client upload queue and project creation integration. Existing local attachment UI changes were preserved. No environment files or bucket settings were inspected.

## Why uploads appear stuck

The browser intentionally polls every 1.5 seconds, at most 80 checks per attempt. `completed` describes the upload session, not the file's security state. `VerifyAndScanFile` leaves a file `pending_upload` with null verified metadata until content inspection and ClamAV scanning succeed. Only then can it become `ready` and the client call the attachment endpoint. Uploading bytes successfully therefore does not create an attachment.

There is a confirmed recovery defect in `infrastructure/processing/file-processing-queue.adapter.ts`: retained failed jobs keep their deterministic ID, and `queue.add` with that ID does not schedule another execution. Fixed by explicitly retrying retained terminal jobs with a reset attempt budget and tolerating concurrent recovery. [BullMQ documents this duplicate-ID behavior](https://docs.bullmq.io/guide/queues/auto-removal-of-jobs).

This explains a persistent stuck state after worker retries fail; it does **not** identify the first worker failure in the reported live incident. Check the retained verification job's failure reason, attempts and state, and verify that the worker can reach object storage and ClamAV. The checked-in Compose stack has no ClamAV service, so an independently deployed scanner is required. Keep scanning fail-closed.

The example rejected document is a different file, dated November 4, from the November 12 response. `Upload session expired` comes from cleanup of an uncompleted session; it does not prove that the completed session in the response expired.

Live diagnosis limitation: Windows browser automation stopped because it could not verify the browser URL; no live Network response was read. Docker's engine was unavailable. The supplied screenshot and source were inspected, but a live end-to-end upload was not verified.

## Changes made

- Redrive retained failed/completed verification jobs; preserve active jobs and existing retention settings.
- Log worker failure identifiers and error types without logging signed URLs, credentials or contents.
- Delete expired staging objects only when the cleanup transaction actually expired that session. A completion winning the race must keep its bytes and reservation.
- Promote the exact version inspected and scanned, rather than discarding its version reference.
- Preserve a client `uploaded` stage before calling completion; retries reuse the existing object/session and reissue idempotent completion. Expired uploads restart with a new session. Polling remains bounded.
- Support discriminated POST/form-fields and PUT/headers upload grants end-to-end. Existing S3 responses remain compatible. Bound storage transfer time with a timeout.
- Add regression tests for recovery, cleanup races and scan/promotion safety.

## Remaining recommendations, in priority order

| Priority | Code area                                                                      | Recommendation and reason                                                                                                                                                                                                                                                                                                                                                    |
| -------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| High     | `infrastructure/authorization/orbit-file-authorization.adapter.ts`             | Distinguish read, attach and remove permissions. Currently active workspace membership plus target existence permits removal, including another member's attachment. Integrate the project's/work item's canonical permission policies; add cross-tenant, read-only-member and revoked-access tests.                                                                         |
| High     | Same authorization adapter                                                     | Comment/document/team/sprint targets are enumerated but denied by the default branch; only projects and work items are implemented. Add target-specific authorization adapters, resolving comments through their parent and tenant. Keep unsupported targets denied until implemented.                                                                                       |
| High     | `application/use-cases/attach-file` and attachment repository                  | Make attach retries idempotent: look up the active `(workspaceId, fileId, targetType, targetId)` relationship and return it, including after a concurrent unique-key conflict. Currently a lost successful response makes a retry return conflict instead of its attachment ID.                                                                                              |
| Medium   | Upload intent and project creation                                             | Persist the intended target/placement and complete the authorized attachment workflow durably after verification, or make pending uploads resumable after navigation. Currently the browser alone performs the final attach call, so closing it can leave a ready but unlinked file. Recheck target permissions when finalizing.                                             |
| High     | Processing recovery and scanner deployment                                     | Add queue health/readiness, queue-age/failed-job alerts and a bounded operational retry/dead-letter policy. The reconciler can now recover failures, but persistent infrastructure failure must alert operators. Consider an outbox for durable Mongo-to-queue dispatch and persistent processing diagnostics with safe client-facing codes.                                 |
| Medium   | `presentation/http/filters/file-http-exception.filter.ts`                      | Use the common response envelope and shared expected-error mapping. This filter currently writes `{statusCode, code, message}` directly, bypassing the global envelope. Keep domain errors transport-independent.                                                                                                                                                            |
| Medium   | `application/ports/file-config.port.ts`, configuration and storage composition | Separate upload policy settings from S3/ClamAV infrastructure configuration. Resolve storage adapters from a registry keyed by `locationId`; keep old locations readable during migration. One global S3 binding and one accepted location currently prevent simultaneous old/new providers. POST/PUT grant support added here is a seam, not a complete provider migration. |
| Medium   | Retention and `remove-attachment`                                              | Implement durable garbage collection for abandoned ready files and unreferenced objects after a retention window; account for shared references, versions and legal holds before deleting. Release used quota only after confirmed physical deletion. Detaching currently leaves stored bytes and quota.                                                                     |
| Medium   | `streaming-file-content-inspector.adapter.ts`                                  | Use maintained format parsers with resource limits in an isolated worker; magic-byte checks are only one layer. MP4's generic `ftyp` and EBML headers do not uniquely establish the declared media format. Consider safe preview transcoding and CDR for document formats.                                                                                                   |
| Medium   | Client upload queue                                                            | Add cancellation on unmount/removal and bind retry state to its original target/workspace. For long processing, use backoff or notifications, while retaining a bounded polling fallback. The current two-minute client wait is shorter than some scanner retry sequences.                                                                                                   |

The module already has useful Clean Architecture boundaries: framework-free file entities/value objects, symbolic application ports, infrastructure adapters, a transactional unit of work, optimistic revisions, quota reservations and explicit lifecycle rules. Preserve these. For stricter dependency inversion, remove Nest decorators from application use cases through composition factories; this is lower priority than authorization and recovery. Do not introduce interfaces for every class without an actual substitution/testing boundary.

## Private storage pattern

Store binary bytes in private object storage. Store metadata in MongoDB: file ID, tenant/owner, original and verified MIME types, verified size/checksum, lifecycle and scan state, and `{ locationId, key, versionId }`. Keep business attachments as separate tenant-scoped relationships. This repository already uses that structure; persistent public URLs are unnecessary.

Authorize every access against current tenant membership and the referenced business resource, then issue a short-lived signed URL, or proxy delivery when immediate revocation is required. Signed URLs are temporary bearer credentials: anyone holding one can use it until it expires. Do not persist or log them. [AWS guidance](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html).

Use private staging/quarantine → validate actual size/type/hash → malware scan → promote the verified immutable version → mark ready → attach. Generate opaque keys; filenames are display metadata. Never skip scanning to clear a stuck upload. This follows the layered controls in the [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html).

Verify deployment controls separately: S3 Block Public Access; disabled ACLs; least-privilege runtime roles and staging-only upload grants; TLS-only bucket policy; encryption at rest (KMS when its controls are needed); restricted CORS origins; staging/noncurrent-version lifecycle rules; audit logging and alerts. For MongoDB, use TLS, least-privilege service identities, encryption at rest and encrypted backups. Opaque keys alone are not an authorization mechanism. These settings were not verified in the user's cloud account. [AWS presigned-access guardrails](https://docs.aws.amazon.com/prescriptive-guidance/latest/presigned-url-best-practices/).

Provider migration: introduce a new configured location/adapter, direct new uploads there, keep routing reads to old locations, copy and verify existing bytes, then atomically switch each file's object reference. Require every adapter to honor conditional reads, immutable promotion, private grants and version semantics; fail closed when a provider cannot meet them. The new grant union does not itself implement Azure/GCS adapters or resumable multipart transfers.

## Validation

Commands ran from the repository root with pnpm 12.11.2 and the app's bundled Node 24.22.1 prepended to the process PATH. The normal Node shim had no active version. CI's Node 26.11.1 was not available through that shim.

- `pnpm --filter api test --runInBand modules/file` with process-local `NODE_OPTIONS=--experimental-vm-modules`: 11 regression tests passed. Without that flag, the existing Jest/CommonJS setup could not load Nest 12's ESM packages.
- `pnpm --filter api exec eslint src/modules/file --max-warnings=0`: passed.
- `pnpm --filter client exec eslint src/entities/file/api/file.api.ts src/entities/file/model/file.types.ts src/features/file-upload/model/use-file-upload-queue.ts --max-warnings=0`: passed.
- `pnpm --filter api typecheck`: blocked by existing `videoUrl` properties in `notification.entity.spec.ts:51,64`; no file-module diagnostics after correcting the new Swagger annotations.
- `pnpm --filter client typecheck`: blocked by an existing missing generated sprint route in `.next/types/validator.ts:204` and the generic combobox callback in `create-project-dialog.tsx:112`.
- Scoped `git diff --check`: passed. The full working-tree check also found pre-existing trailing whitespace in the user's `update-project-form.tsx:644`, which was preserved.
- Live upload, attachment creation and AWS bucket-policy validation were not run: browser automation could not safely identify the URL, Docker's engine was unavailable, and cloud settings were not inspected.
