'use client'

import { useState } from 'react'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import { Field, FieldContent, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { Separator } from '@/shared/ui/separator'

import { useUser } from '@/entities/user/model/user.store'
import { PasswordSection } from './password-section'
import { ActiveSession } from './active-session'

export const SecuritySettings = () => {
  const user = useUser()

  const [emailDialogOpen, setEmailDialogOpen] = useState(false)

  const isEmailVerified = user?.emailVerified ?? false

  return (
    <div className="mx-auto w-full p-2">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight">Security</h1>

        <p className="text-muted-foreground mt-1 text-sm">
          Manage your account security and access.
        </p>
      </div>

      {/* Account */}
      <section>
        <h2 className="text-lg font-medium">Account</h2>

        <div className="mt-3">
          {/* Email */}
          <Field
            orientation="horizontal"
            className="min-h-14 justify-between py-2"
          >
            <FieldContent className="my-auto min-w-36">
              <FieldLabel>Email</FieldLabel>
            </FieldContent>

            <div className="my-auto flex items-center gap-3">
              <span className="text-muted-foreground max-w-sm truncate text-sm">
                {user?.email ?? '—'}
              </span>

              <Badge variant={isEmailVerified ? 'secondary' : 'outline'}>
                {isEmailVerified ? 'Verified' : 'Unverified'}
              </Badge>

              {!isEmailVerified && (
                <Button type="button" variant="outline" size="sm">
                  Verify
                </Button>
              )}

              <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline" size="sm">
                    Change
                  </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Change email</DialogTitle>

                    <DialogDescription>
                      Enter your new email address. You may need to verify it
                      before it can be used to sign in.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <label
                        htmlFor="current-email"
                        className="text-sm font-medium"
                      >
                        Current email
                      </label>

                      <Input
                        id="current-email"
                        type="email"
                        value={user?.email ?? ''}
                        readOnly
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="new-email"
                        className="text-sm font-medium"
                      >
                        New email
                      </label>

                      <Input
                        id="new-email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEmailDialogOpen(false)}
                    >
                      Cancel
                    </Button>

                    <Button type="button">Update email</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </Field>

          {/* Password */}

          <PasswordSection />
        </div>
      </section>

      <Separator className="my-4" />

      {/* Sessions */}
      <ActiveSession />
    </div>
  )
}
