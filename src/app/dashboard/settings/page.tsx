import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import SettingsContent from '@/components/settings-content'

export default async function SettingsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await currentUser()
  
  let dbUser = await prisma.user.findUnique({
    where: { email: user?.emailAddresses[0]?.emailAddress },
    include: { 
      repos: { 
        orderBy: { lastPushed: 'desc' } 
      }
    }
  })

  if (!dbUser && user?.emailAddresses[0]?.emailAddress) {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || null
    dbUser = await prisma.user.create({
      data: {
        clerkId: userId,
        email: user.emailAddresses[0].emailAddress,
        name: fullName,
        avatarUrl: user.imageUrl,
      },
      include: { repos: { orderBy: { lastPushed: 'desc' } } }
    })
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-bold text-xl">Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-4">
            <img 
              src={user?.imageUrl} 
              alt={user?.firstName || 'User'} 
              className="h-8 w-8 rounded-full"
            />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
        
        <SettingsContent 
          user={{
            githubHandle: dbUser?.githubHandle || null,
            githubConnected: dbUser?.githubConnected || false,
            twitterHandle: (dbUser as any)?.twitterHandle || null,
            forwardEmail: (dbUser as any)?.forwardEmail || null,
            defaultRepoView: (dbUser as unknown)?.defaultRepoView || 'readme',
          }}
          repos={dbUser?.repos || []}
        />
      </div>
    </div>
  )
}
