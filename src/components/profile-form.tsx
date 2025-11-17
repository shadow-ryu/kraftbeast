'use client'

import { useActionState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { updateProfile } from '@/lib/actions/profile'

interface ProfileFormProps {
  name: string
  bio: string
  twitterHandle: string
  linkedinUrl: string
  forwardEmail: string
}

export default function ProfileForm({ name, bio, twitterHandle, linkedinUrl, forwardEmail }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState(updateProfile, {
    success: false,
    error: null
  })

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">Profile Information</h2>
      <form action={formAction} className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={name}
            placeholder="Enter your name"
            disabled={isPending}
          />
        </div>
        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            name="bio"
            defaultValue={bio}
            placeholder="A short bio about yourself"
            rows={3}
            disabled={isPending}
          />
        </div>
        <div>
          <Label htmlFor="twitter">Twitter Handle</Label>
          <Input
            id="twitter"
            name="twitterHandle"
            defaultValue={twitterHandle}
            placeholder="username (without @)"
            disabled={isPending}
          />
        </div>
        <div>
          <Label htmlFor="linkedin">LinkedIn URL</Label>
          <Input
            id="linkedin"
            name="linkedinUrl"
            type="url"
            defaultValue={linkedinUrl}
            placeholder="https://linkedin.com/in/yourprofile"
            disabled={isPending}
          />
        </div>
        <div>
          <Label htmlFor="email">Forward Email</Label>
          <Input
            id="email"
            name="forwardEmail"
            type="email"
            defaultValue={forwardEmail}
            placeholder="Where to receive contact form messages"
            disabled={isPending}
          />
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : 'Save Profile'}
        </Button>
        {state.success && (
          <p className="text-sm text-green-600">Profile updated successfully!</p>
        )}
        {state.error && (
          <p className="text-sm text-red-600">{state.error}</p>
        )}
      </form>
    </Card>
  )
}
