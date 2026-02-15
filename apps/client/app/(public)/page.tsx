'use client'

import { useUserStore } from '@/entities/user/model/user.store'
import { Button } from '@/shared/ui/button'

export default function Page() {
  const { user, accessToken } = useUserStore()

  console.log('USER', user)
  console.log('TOKEN', accessToken)

  return (
    <div className="flex items-center justify-center min-h-svh">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Hello World</h1>
        <Button size="sm">Button</Button>
      </div>
    </div>
  )
}
