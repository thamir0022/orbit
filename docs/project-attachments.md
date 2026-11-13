# Project attachment lifecycle

Attachment titles and order belong to the attachment relationship, not the stored
file. `displayName` is editable; `originalName` stays immutable. Existing links
without a title display the original filename. The database stores an opaque
`locationId`, object key, and version ID, never a persistent access URL. Previews
continue to authorize workspace membership and the target before signing a
short-lived URL.

## Management

- `PATCH /api/v1/files/attachments/:id` updates a title with an expected revision.
- `PATCH /api/v1/files/attachments/order` atomically applies the complete ordered
  list of IDs and revisions for a workspace target. Stale, incomplete, duplicate,
  and foreign lists are rejected. This endpoint is bounded to 100 attachments;
  larger collections need a paginated ordering contract before enabling reorder.
- Upload titles default to the original filename. Retried attachment creation
  returns the existing active link instead of creating another relationship.
- React Query keys include the workspace. Upload, title, removal, and order
  mutations invalidate the same target cache. Motion handles wrapping pill
  layouts; drag handles also support arrow-key movement and reduced motion.

## Deletion policy

Deleting an attachment removes its relationship immediately. If other links use
the same file, their access and bytes are preserved. Removing the last link
tombstones the file in the same transaction, so it cannot be attached or receive
new access grants. All link creation/removal transactions update the shared file
revision to serialize competing last-reference changes.

The current product retention policy is **30 days after the last detach**. This
is an explicit application policy, not an industry-mandated duration. The existing
reconciliation worker finds eligible tombstones, checks references again, and
permanently deletes the stored object through `ObjectStoragePort`. Only after
provider success does a transaction release used storage quota and set
`purgedAt`. The MongoDB record remains as audit metadata. Failed provider or DB
operations remain retryable; duplicate cleanup does not release quota twice.
There is no user-facing restore endpoint in this change.

The S3 adapter deletes the stored version explicitly, including the `null`
revision for originally unversioned objects. A plain DELETE against a versioned
bucket can leave bytes behind a delete marker. See
[AWS object-version deletion](https://docs.aws.amazon.com/AmazonS3/latest/userguide/DeletingObjectVersions.html).
Other providers must implement the same idempotent, physical-deletion contract
for their immutable object revision.

## Operations and limits

- Deploy the API and client together. Existing records are compatible with a
  missing cleanup timestamp fields. Ensure the declared
  `{ status, purgedAt, purgeAttemptedAt, deletedAt }`
  MongoDB index is created by the deployment's index-management process.
- Run the Redis processing worker/reconciliation scheduler. Monitor disposal
  failures and backlog; the worker processes bounded batches, rotating failed or
  held objects behind unattempted work using `purgeAttemptedAt`.
- Grant the worker `s3:DeleteObjectVersion` for final objects as well as the
  permissions needed for staging cleanup. Object Lock/retention restrictions
  must not be bypassed; failures leave quota and tombstones unchanged.
- Keep bucket public access blocked, encryption enabled, and staging lifecycle
  expiry configured. Do not put an unconditional expiration rule on live final
  objects. Manage abandoned uploads and historical unreferenced versions with a
  separate, reviewed lifecycle policy.
- Already issued signed URLs can remain usable until their short expiry. Strict
  immediate revocation requires a proxy or an access gateway that rechecks each
  request. Preview URLs are discarded from the client cache on close/removal.
- A future legal-hold or restore feature must extend the lifecycle before it can
  reactivate tombstoned files; an unconditional restore would race disposal.
