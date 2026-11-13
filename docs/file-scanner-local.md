# Local file scanner

The file worker requires ClamAV. A successful S3 upload and `202 processing` do not mean that verification has passed. If the queue reports `connect ECONNREFUSED 127.0.0.1:3310`, the local scanner is not listening. Never bypass scanning or mark these files ready manually.

## Native Windows development

The November 12 incident was traced to the exact upload's retained BullMQ job. Its five attempts failed connecting to `127.0.0.1:3310`. The native Windows API, Redis (Memurai), and MongoDB were running; ClamAV was absent.

The official ClamAV 1.4.6 LTS Windows x64 archive was downloaded from [ClamAV](https://www.clamav.net/downloads) and its detached signature verified against the Talos public key published on that page. The verified fingerprint was `5BAD CA26 65EF 59DC F8A2 3D8B 707F 0DB4 8083 6771`.

Local installation layout (outside the repository):

```text
%LOCALAPPDATA%\Orbit\clamav\
  runtime\clamav-1.4.6.win.x64\
  database\
  clamd.conf
  freshclam.conf
  clamd.log
  freshclam.log
```

Run from the repository root before testing uploads:

```powershell
pnpm files:scanner
```

The script updates official signatures, starts `clamd` bound to `127.0.0.1:3310`, checks readiness, and runs FreshClam in the background. It does not register a Windows service or start automatically after reboot. Run the command again after restarting Windows. It leaves existing configuration files intact. For a fresh machine, download and verify the official Windows archive first and extract it into the runtime directory above; the script explains a missing installation rather than downloading or trusting binaries silently.

`FILE_CLAMAV_HOST` must resolve to this scanner from the API's runtime and `FILE_CLAMAV_PORT` must match 3310. No environment files were read or modified during this fix. If running the API inside Docker instead, `localhost` refers to that container: use a private scanner service on the same container network and configure its service hostname. This helper is for the native Windows development setup only.

The scanner accepts streams up to 110 MiB, matching the API scanner adapter. It has bounded concurrency and alerts on scan-limit exhaustion. Never expose the unauthenticated ClamAV TCP protocol publicly. Keep the engine itself patched as well as updating signatures. [ClamAV configuration documentation](https://docs.clamav.net/manual/Usage/Configuration.html).

## Upload behavior during scanner outages

`GET /files/uploads/:sessionId` now includes `processingStatus` (`queued`, `processing`, `retrying`, `failed`, or `null`). The application obtains this through a dedicated port, after the existing tenant/uploader authorization. Raw queue errors and storage credentials are not returned.

When verification is retrying or has failed, the client stops its readiness polling and shows a retryable processing error. It keeps the upload session and bytes. Once the scanner is restored, the worker/reconciler can finish processing and the UI's retry action can complete the attachment without re-uploading. Terminal rejected files still require a new upload. A client already closed/navigated away cannot create the final attachment automatically; durable attachment intent remains a separate recommendation in the module review.
