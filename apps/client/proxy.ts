import { NextResponse, type NextRequest } from 'next/server'

const GUEST_ONLY_ROUTES = ['/sign-in', '/sign-up', '/password-reset'] as const
const PUBLIC_ROUTES = ['/invite'] as const
const AUTH_REDIRECT_URL = '/workspaces'

function isMatchedPath(pathname: string, routes: readonly string[]) {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const refreshToken = request.cookies.get('refresh_token')?.value

  const isAuthenticated = Boolean(refreshToken)

  if (isMatchedPath(pathname, PUBLIC_ROUTES)) return NextResponse.next()

  const isGuestOnlyRoute = isMatchedPath(pathname, GUEST_ONLY_ROUTES)

  // Authenticated users should not access guest-only routes
  if (isGuestOnlyRoute) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL(AUTH_REDIRECT_URL, request.url))
    }

    return NextResponse.next()
  }

  // Unauthenticated users should not access protected routes
  if (!isAuthenticated) {
    const signInUrl = new URL('/sign-in', request.url)
    signInUrl.searchParams.set('redirecturl', pathname)

    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|onboarding).*)'],
}
