'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Loader } from 'lucide-react'

import { getCurrentUserApi } from '@/entities/user/api/get-current-user.api'
import { useUser, useUserActions } from '@/entities/user/model/user.store'

const GUEST_ROUTES = [
  '/sign-in',
  '/sign-up',
  '/password-reset',
  '/invite',
] as const

interface GlobalSessionProviderProps {
  children: React.ReactNode
}

function isGuestPathname(pathname: string): boolean {
  return GUEST_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
}

function SessionLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Loader className="size-8 animate-spin text-primary" />
    </div>
  )
}

export function GlobalSessionProvider({
  children,
}: GlobalSessionProviderProps) {
  const router = useRouter()
  const pathname = usePathname()

  const user = useUser()
  const { setUser } = useUserActions()

  const isGuestRoute = isGuestPathname(pathname)

  const {
    data: currentUser,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['user', 'current'],
    queryFn: getCurrentUserApi,
    enabled: !isGuestRoute,
    retry: false,
  })

  /**
   * Keep Zustand in sync with the current authenticated user.
   */
  useEffect(() => {
    if (!currentUser) {
      return
    }

    if (currentUser.id !== user?.id) {
      setUser(currentUser)
    }
  }, [currentUser, user?.id, setUser])

  /**
   * Redirect unauthenticated users to sign-in.
   *
   * Navigation must happen inside an effect,
   * never during render.
   */
  useEffect(() => {
    if (isGuestRoute) {
      return
    }

    if (isError && !user) {
      router.replace('/sign-in')
    }
  }, [isGuestRoute, isError, user, router])

  /**
   * Guest routes should render immediately without
   * initializing the session query.
   */
  if (isGuestRoute) {
    return <>{children}</>
  }

  /**
   * Wait for the initial session request.
   */
  if (!user && isPending) {
    return <SessionLoader />
  }

  /**
   * Session request failed and there is no authenticated
   * user. Keep the screen stable while redirecting.
   */
  if (!user && isError) {
    return <SessionLoader />
  }

  return <>{children}</>
}
