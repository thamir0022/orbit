import { httpClient } from '@/shared/api/config/http-client'
import { API_ROUTES } from '@/shared/api/routes/api.routes'

import type {
  AttachFileRequest,
  AttachFileResponse,
  CompleteFileUploadResponse,
  FileUploadStatusResponse,
  InitiateFileUploadRequest,
  InitiateFileUploadResponse,
} from '../model/file.types'

/** Initiates a private file upload through Orbit's API. */
export async function initiateFileUpload(
  payload: InitiateFileUploadRequest
): Promise<InitiateFileUploadResponse> {
  const response = await httpClient.post<InitiateFileUploadResponse>(
    API_ROUTES.FILES.UPLOADS,
    payload
  )

  return response.data
}

/** Confirms transfer completion and queues server-side processing. */
export async function completeFileUpload(
  uploadSessionId: string
): Promise<CompleteFileUploadResponse> {
  const response = await httpClient.post<CompleteFileUploadResponse>(
    `${API_ROUTES.FILES.UPLOADS}/${uploadSessionId}/complete`
  )

  return response.data
}

/** Retrieves the verified server lifecycle status of an upload. */
export async function getFileUploadStatus(
  uploadSessionId: string
): Promise<FileUploadStatusResponse> {
  const response = await httpClient.get<FileUploadStatusResponse>(
    `${API_ROUTES.FILES.UPLOADS}/${uploadSessionId}`
  )

  return response.data
}

/** Attaches a ready file to an authorized business entity. */
export async function attachFile(
  payload: AttachFileRequest
): Promise<AttachFileResponse> {
  const response = await httpClient.post<AttachFileResponse>(
    API_ROUTES.FILES.ATTACHMENTS,
    payload
  )

  return response.data
}

interface UploadToStorageOptions {
  readonly file: File
  readonly upload: InitiateFileUploadResponse
  readonly onProgress?: (percentage: number) => void
}

/** Transfers bytes using the provider's short-lived upload instructions. */
export function uploadToStorage({
  file,
  upload,
  onProgress,
}: UploadToStorageOptions): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open(upload.method, upload.url)
    request.withCredentials = false
    request.timeout = 5 * 60 * 1000

    let body: FormData | File = file
    if (upload.method === 'POST') {
      const formData = new FormData()
      // Signed fields must precede the file; the browser sets the boundary.
      for (const [key, value] of Object.entries(upload.fields)) {
        formData.append(key, value)
      }
      formData.append('file', file, file.name)
      body = formData
    } else {
      for (const [key, value] of Object.entries(upload.headers)) {
        request.setRequestHeader(key, value)
      }
    }

    request.upload.onprogress = (event) => {
      if (!event.lengthComputable || event.total === 0) return

      const percentage = Math.min(
        100,
        Math.round((event.loaded / event.total) * 100)
      )

      onProgress?.(percentage)
    }

    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        onProgress?.(100)
        resolve()
        return
      }

      reject(
        new Error(
          `Storage upload failed (HTTP ${request.status}). Please retry.`
        )
      )
    }

    request.onerror = () => {
      reject(new Error('Network error while uploading the file.'))
    }

    request.onabort = () => {
      reject(new Error('File upload was cancelled.'))
    }

    request.ontimeout = () => {
      reject(new Error('File upload timed out. Please retry.'))
    }

    request.send(body)
  })
}
