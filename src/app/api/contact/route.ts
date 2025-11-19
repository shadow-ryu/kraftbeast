import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { decryptUserData } from '@/lib/encryption'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, name, email, message } = body

    console.log('Contact form submission:', { username, name, email, message })

    if (!username || !name || !email || !message) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { githubHandle: username },
      select: {
        id: true,
        clerkId: true,
        forwardEmail: true,
        resendApiKey: true
      }
    })

    console.log('User found:', { id: user?.id, forwardEmail: user?.forwardEmail, hasResendKey: !!user?.resendApiKey })

    if (!user || !user.forwardEmail) {
      return NextResponse.json({ error: 'User not found or no forward email set' }, { status: 404 })
    }

    // Check if user has configured their own Resend API key
    if (!user.resendApiKey) {
      console.error('User has not configured Resend API key')
      return NextResponse.json({ 
        success: false,
        error: 'Contact form not configured. User needs to add their Resend API key in settings.' 
      }, { status: 403 })
    }

    // Decrypt the user's Resend API key using their identifiers
    let decryptedKey: string
    try {
      decryptedKey = decryptUserData(user.resendApiKey, user.id, user.clerkId)
    } catch (error) {
      console.error('Error decrypting Resend API key:', error)
      return NextResponse.json({ 
        success: false,
        error: 'Failed to decrypt API key. Please reconfigure in settings.' 
      }, { status: 500 })
    }

    // Create Resend instance with user's API key
    const resend = new Resend(decryptedKey)

    console.log('Sending email to:', user.forwardEmail)

    // Send email using user's Resend API key
    const result = await resend.emails.send({
      from: 'KraftBeast <onboarding@resend.dev>', // Default Resend sender for testing
      to: user.forwardEmail,
      replyTo: email, // Visitor can reply directly to the sender
      subject: `New contact from ${name} via KraftBeast`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Contact from Your Portfolio</h2>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>From:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          </div>
          <div style="background: white; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            This message was sent via your KraftBeast portfolio contact form. Reply to this email to respond directly to ${name}.
          </p>
        </div>
      `,
    })

    console.log('Email sent successfully:', result)

    return NextResponse.json({ success: true, emailId: result.data?.id })
  } catch (error) {
    console.error('Error sending contact:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to send message', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
