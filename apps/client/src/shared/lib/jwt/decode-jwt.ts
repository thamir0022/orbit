/**
 * Decodes a JWT payload safely in Edge environments.
 * Avoids Node.js `Buffer` in favor of standard Web APIs (`atob`).
 */
export function decodeJwtPayload<T = Record<string, unknown>>(
  token: string
): T | null {
  try {
    // 1. Ensure the token is structurally a JWT
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const base64Url = parts[1]
    if (!base64Url) return null

    // 2. Decode Base64Url to Base64
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')

    // 3. Decode into a JSON string and parse
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )

    return JSON.parse(jsonPayload) as T
  } catch (error) {
    // Fails safely (returns null) if the token is tampered with or malformed
    return null
  }
}
