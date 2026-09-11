'use client'

import { useUser } from '@/entities/user/model/user.store'
import { useWorkspace } from '@/entities/workspace/model/workspace.store'
import Link from 'next/link'

export default function Overview() {
  const user = useUser()
  const workspace = useWorkspace()

  console.log('USER : ', user)
  console.log('WORKSPACE : ', workspace)

  return (
    <div className="size-full">
      <h1>Workspace Overview</h1> <Link href={'/'}>Home</Link>
    </div>
  )
}
