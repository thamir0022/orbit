import { NextResponse, type NextRequest } from 'next/server'

const GUEST_ONLY_ROUTES = ['/sign-in', '/sign-up', '/password-reset'] as const

const PUBLIC_ROUTES = ['/invite'] as const

const AUTH_REDIRECT_URL = '/workspaces'
const SIGN_IN_URL = '/sign-in'

function isMatchedPath(pathname: string, routes: readonly string[]): boolean {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const refreshToken = request.cookies.get('refresh_token')?.value

  const isAuthenticated = Boolean(refreshToken)

  /**
   * Public routes don't require authentication.
   */
  if (isMatchedPath(pathname, PUBLIC_ROUTES)) {
    return NextResponse.next()
  }

  /**
   * Authenticated users should not access guest-only routes.
   */
  const isGuestOnlyRoute = isMatchedPath(pathname, GUEST_ONLY_ROUTES)

  if (isGuestOnlyRoute) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL(AUTH_REDIRECT_URL, request.url))
    }

    return NextResponse.next()
  }

  /**
   * Protected routes require both access and refresh tokens.
   */
  if (!isAuthenticated) {
    const signInUrl = new URL(SIGN_IN_URL, request.url)

    signInUrl.searchParams.set('redirecturl', pathname)

    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|onboarding).*)'],
}
