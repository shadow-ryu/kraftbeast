import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text()
    const headers = {
      'svix-id': request.headers.get('svix-id') || '',
      'svix-timestamp': request.headers.get('svix-timestamp') || '',
      'svix-signature': request.headers.get('svix-signature') || '',
    }

    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET
    if (!webhookSecret) {
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    const wh = new Webhook(webhookSecret)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const evt = wh.verify(payload, headers) as any

    // Handle user.created event
    if (evt.type === 'user.created') {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data

      await prisma.user.upsert({
        where: { email: email_addresses[0]?.email_address },
        update: {
          clerkId: id,
          name: `${first_name || ''} ${last_name || ''}`.trim() || null,
          avatarUrl: image_url,
        },
        create: {
          clerkId: id,
          email: email_addresses[0]?.email_address,
          name: `${first_name || ''} ${last_name || ''}`.trim() || null,
          avatarUrl: image_url,
        }
      })
    }

    // Handle user.updated event
    if (evt.type === 'user.updated') {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data

      await prisma.user.update({
        where: { email: email_addresses[0]?.email_address },
        data: {
          clerkId: id,
          name: `${first_name || ''} ${last_name || ''}`.trim() || null,
          avatarUrl: image_url,
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Clerk webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
