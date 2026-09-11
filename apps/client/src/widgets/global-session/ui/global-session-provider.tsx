'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Loader } from 'lucide-react'
import { getCurrentUserApi } from '@/entities/user/api/get-current-user.api'
import { useUser, useUserActions } from '@/entities/user/model/user.store'

// Define routes that should completely bypass session initialization
const GUEST_ROUTES = ['/sign-in', '/sign-up', '/password-reset', '/invite']

interface GlobalSessionProviderProps {
  children: React.ReactNode
}

export function GlobalSessionProvider({
  children,
}: GlobalSessionProviderProps) {
  const pathname = usePathname()
  const user = useUser()
  const { setUser } = useUserActions()

  // Check if the current route is a public/guest route
  const isGuestRoute = GUEST_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  // 1. Fetch the global user data (Only if NOT on a guest route)
  const { data, isPending, isError } = useQuery({
    queryKey: ['user', 'current'],
    queryFn: getCurrentUserApi,
    retry: false,
    enabled: !isGuestRoute, // CRITICAL: Stops the network call on public pages
  })

  // 2. Synchronize data into Zustand
  useEffect(() => {
    if (data && data.id !== user?.id) {
      setUser(data)
    }
  }, [data, user?.id, setUser])

  // 3. 🚨 THE FIX: Public Route Short-Circuit
  // If the user is looking at /sign-in, render it immediately without any checks.
  if (isGuestRoute) {
    return <>{children}</>
  }

  // 4. Authenticated Boot Loading State
  // This loader will now ONLY show on private paths while loading the session.
  if (!user && isPending) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // 5. Silent Error Fallback
  if (isError && !user) {
    return null
  }

  return <>{children}</>
}
