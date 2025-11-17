'use server'

import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

interface UpdateProfileState {
  success: boolean
  error: string | null
}

export async function updateProfile(
  _prevState: UpdateProfileState,
  formData: FormData
): Promise<UpdateProfileState> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }

    const name = formData.get('name') as string
    const bio = formData.get('bio') as string
    const twitterHandle = formData.get('twitterHandle') as string
    const linkedinUrl = formData.get('linkedinUrl') as string
    const forwardEmail = formData.get('forwardEmail') as string

    await prisma.user.update({
      where: { clerkId: userId },
      data: {
        name,
        bio,
        twitterHandle,
        linkedinUrl,
        forwardEmail
      }
    })

    revalidatePath('/dashboard/profile')
    
    return { success: true, error: null }
  } catch (error) {
    console.error('Failed to update profile:', error)
    return { success: false, error: 'Failed to update profile. Please try again.' }
  }
}
