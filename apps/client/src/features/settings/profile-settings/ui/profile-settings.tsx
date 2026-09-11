'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

import { useUser } from '@/entities/user/model/user.store'
import { useUpdateProfileMutation } from '../model/use-update-profile'

type ProfileFormData = {
  firstName: string
  lastName: string
  displayName: string
}

const getProfileFormData = (
  user: ReturnType<typeof useUser> | null
): ProfileFormData => ({
  firstName: user?.firstName ?? '',
  lastName: user?.lastName ?? '',
  displayName: user?.displayName ?? '',
})

export const ProfileSettings = () => {
  const user = useUser()
  const { mutateAsync: updateProfile, isPending } = useUpdateProfileMutation()

  const [isEditing, setIsEditing] = useState(false)

  const [formData, setFormData] = useState<ProfileFormData>(() =>
    getProfileFormData(user)
  )

  useEffect(() => {
    setFormData(getProfileFormData(user))
  }, [user])

  const handleChange =
    (field: keyof ProfileFormData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }))
    }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setFormData(getProfileFormData(user))
    setIsEditing(false)
  }

  const handleSave = async () => {
    try {
      await updateProfile(formData)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update profile', error)
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>

        <p className="text-muted-foreground text-sm">
          Manage your personal information.
        </p>
      </div>

      <div className="mt-10 space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>

            <Input
              id="firstName"
              value={formData.firstName}
              readOnly={!isEditing}
              onChange={handleChange('firstName')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>

            <Input
              id="lastName"
              value={formData.lastName}
              readOnly={!isEditing}
              onChange={handleChange('lastName')}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="displayName">Display Name</Label>

          <Input
            id="displayName"
            value={formData.displayName}
            readOnly={!isEditing}
            onChange={handleChange('displayName')}
          />
        </div>

        <div className="flex justify-end border-t pt-6">
          {isEditing ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isPending}
              >
                Cancel
              </Button>

              <Button onClick={handleSave} disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          ) : (
            <Button onClick={handleEdit}>Edit Profile</Button>
          )}
        </div>
      </div>
    </div>
  )
}
