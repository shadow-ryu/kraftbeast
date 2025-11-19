import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { encryptUserData, decryptUserData, maskApiKey } from '@/lib/encryption'

// GET - Check if user has Resend key configured
export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, resendApiKey: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const hasKey = !!user.resendApiKey
    let maskedKey = null

    if (hasKey && user.resendApiKey) {
      try {
        const decryptedKey = decryptUserData(user.resendApiKey, user.id, userId)
        maskedKey = maskApiKey(decryptedKey)
      } catch (error) {
        console.error('Error decrypting key for display:', error)
      }
    }

    return NextResponse.json({ 
      hasKey,
      maskedKey
    })
  } catch (error) {
    console.error('Error checking Resend key:', error)
    return NextResponse.json({ 
      error: 'Failed to check Resend key',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST - Save or update Resend API key
export async function POST(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { resendApiKey } = body

    if (!resendApiKey || typeof resendApiKey !== 'string') {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 400 })
    }

    // Validate Resend API key format (starts with re_)
    if (!resendApiKey.startsWith('re_')) {
      return NextResponse.json({ 
        error: 'Invalid Resend API key format. Key should start with "re_"' 
      }, { status: 400 })
    }

    // Get user to access their database ID
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Encrypt the API key using user's identifiers
    const encryptedKey = encryptUserData(resendApiKey, user.id, userId)

    // Update user record
    await prisma.user.update({
      where: { clerkId: userId },
      data: { resendApiKey: encryptedKey }
    })

    // Return masked key for display
    const maskedKey = maskApiKey(resendApiKey)

    return NextResponse.json({ 
      success: true,
      maskedKey,
      message: 'Resend API key saved successfully'
    })
  } catch (error) {
    console.error('Error saving Resend key:', error)
    return NextResponse.json({ 
      error: 'Failed to save Resend key',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// DELETE - Remove Resend API key
export async function DELETE() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.user.update({
      where: { clerkId: userId },
      data: { resendApiKey: null }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Resend API key removed successfully'
    })
  } catch (error) {
    console.error('Error removing Resend key:', error)
    return NextResponse.json({ 
      error: 'Failed to remove Resend key',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
