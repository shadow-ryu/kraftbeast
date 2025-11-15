import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, name, email, message } = body

    console.log('Contact form submission:', { username, name, email, message })

    if (!username || !name || !email || !message) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { githubHandle: username }
    })

    console.log('User found:', { id: user?.id, forwardEmail: user?.forwardEmail })

    if (!user || !user.forwardEmail) {
      return NextResponse.json({ error: 'User not found or no forward email set' }, { status: 404 })
    }

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured')
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }

    console.log('Sending email to:', user.forwardEmail)

    // Send email using Resend
    const result = await resend.emails.send({
      from: 'KraftBeast <contact@buildsforge.com>',
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
      error: 'Failed to send message', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
