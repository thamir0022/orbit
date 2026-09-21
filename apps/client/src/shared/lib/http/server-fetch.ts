import { ApiResponse } from '@orbit/http-client'
import { cookies } from 'next/headers'

/**
 * Custom Error class to encapsulate API errors cleanly.
 * This allows your Next.js error.tsx boundaries to easily read the status code.
 */
export class ServerFetchError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: unknown
  ) {
    super(message)
    this.name = 'ServerFetchError'
  }
}

export interface ServerFetchOptions extends RequestInit {
  // Optional override if you need to hit a different microservice
  baseUrl?: string
}

/**
 * Enterprise SSR Fetch Wrapper.
 * Automatically injects multi-tenant session cookies and parses JSON securely.
 * @param endpoint - The API path (e.g., '/workspaces/acme-corp/context')
 * @param options - Standard fetch options + custom baseUrl
 * @returns A strictly typed Promise of type T
 */
export async function serverFetch<T>(
  endpoint: string,
  options: ServerFetchOptions = {}
): Promise<ApiResponse<T>> {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get('refresh_token')?.value
  const accessToken = cookieStore.get('access_token')?.value

  // 1. Construct the Cookie header securely
  const cookieParts: string[] = []
  if (refreshToken) cookieParts.push(`refresh_token=${refreshToken}`)
  if (accessToken) cookieParts.push(`access_token=${accessToken}`)
  const cookieHeader = cookieParts.join('; ')

  // 2. Merge incoming headers with our required headers
  const headers = new Headers(options.headers)

  // Default to JSON if not specified (crucial for NestJS)
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  // Inject the authorization cookies
  if (cookieHeader) {
    headers.set('Cookie', cookieHeader)
  }

  // 3. Resolve the Base URL (Fallback to env variable)
  const baseUrl = options.baseUrl ?? process.env.API_BASE_URL
  const normalizedEndpoint = endpoint.startsWith('/')
    ? endpoint
    : `/${endpoint}`
  const url = `${baseUrl}${normalizedEndpoint}`

  // 4. Execute the fetch
  const response = await fetch(url, {
    ...options,
    headers,
  })

  // 7. Parse and return strictly typed JSON
  return await response.json()
}
