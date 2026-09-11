'use client'

import { format } from 'date-fns'
import { Building2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import OrbitLogo from '@/shared/ui/orbit-logo'

interface InvitationPageProps {
  invitation: {
    workspaceName: string
    workspaceSlug: string
    workspaceLogoUrl: string | null
    inviterName: string
    roleName: string
    expiresAt: string
    action: 'SIGN_IN' | 'SIGN_UP'
  }

  onContinue: () => void
  onDecline: () => void
}

export function InvitationCard({
  invitation,
  onContinue,
  onDecline,
}: InvitationPageProps) {
  return (
    <Card className="w-full max-w-md border-border shadow-sm">
      <CardContent className="space-y-8 p-8">
        {/* Orbit */}
        <div className="flex justify-center">
          <OrbitLogo variant="brand_name" />
        </div>

        {/* Workspace */}
        <div className="flex flex-col items-center space-y-5">
          <Avatar className="h-16 w-16 rounded-xl">
            <AvatarImage src={invitation.workspaceLogoUrl ?? undefined} />

            <AvatarFallback className="rounded-xl bg-muted text-lg font-semibold">
              {invitation.workspaceName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-2 text-center">
            <p className="text-sm text-muted-foreground">You've been invited</p>

            <h1 className="text-2xl font-semibold tracking-tight">
              Join {invitation.workspaceName}
            </h1>

            <p className="text-sm leading-6 text-muted-foreground">
              <span className="font-medium text-foreground">
                {invitation.inviterName}
              </span>{' '}
              invited you to collaborate as a{' '}
              <span className="font-medium capitalize text-foreground">
                {invitation.roleName}
              </span>
              .
            </p>
          </div>
        </div>

        <Separator />

        {/* Details */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Workspace</span>

            <div className="flex items-center gap-2 font-medium">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              {invitation.workspaceName}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Role</span>

            <span className="font-medium capitalize">
              {invitation.roleName}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Expires</span>

            <span className="font-medium">
              {format(new Date(invitation.expiresAt), 'MMMM d, yyyy')}
            </span>
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="space-y-3">
          <Button className="w-full" size="lg" onClick={onContinue}>
            Continue
          </Button>

          <Button variant="ghost" className="w-full" onClick={onDecline}>
            Decline invitation
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
