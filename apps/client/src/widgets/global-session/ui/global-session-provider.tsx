'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Loader } from 'lucide-react'

import { getCurrentUserApi } from '@/entities/user/api/get-current-user.api'
import { useUser, useUserActions } from '@/entities/user/model/user.store'
import { Button } from '@/shared/ui/button'

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
  const pathname = usePathname()

  const user = useUser()
  const { setUser } = useUserActions()

  const isGuestRoute = isGuestPathname(pathname)

  const {
    data: currentUser,
    isPending,
    isError,
    refetch,
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
   * A failed session request must not bounce between sign-in and workspaces
   * while the refresh cookie is still present.
   */
  if (!user && isError) {
    return (
      <div className="flex size-full flex-col items-center justify-center gap-4">
        <p role="alert">Unable to load your session. Please try again.</p>
        <Button onClick={() => void refetch()}>Try again</Button>
      </div>
    )
  }

  return <>{children}</>
}
