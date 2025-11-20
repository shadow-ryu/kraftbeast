import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import SettingsContent from '@/components/settings-content'
import { ThemeToggle } from '@/components/theme-toggle'

export default async function SettingsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await currentUser()
  
  let dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { 
      repos: { 
        orderBy: { lastPushed: 'desc' } 
      },
      workHistory: {
        orderBy: { order: 'asc' }
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
      include: { 
        repos: { orderBy: { lastPushed: 'desc' } },
        workHistory: { orderBy: { order: 'asc' } }
      }
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-bold text-xl">Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Image 
              src={user?.imageUrl || '/placeholder-avatar.png'} 
              alt={user?.firstName || 'User'} 
              width={32}
              height={32}
              className="rounded-full"
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
            githubAppConnected: (dbUser as { githubAppConnected?: boolean })?.githubAppConnected || false,
            twitterHandle: (dbUser as { twitterHandle?: string | null })?.twitterHandle || null,
            forwardEmail: (dbUser as { forwardEmail?: string | null })?.forwardEmail || null,
            defaultRepoView: (dbUser as { defaultRepoView?: string })?.defaultRepoView || 'readme',
            timelineRangeFrom: (dbUser as { timelineRangeFrom?: Date | null })?.timelineRangeFrom?.toISOString() || null,
            timelineRangeTo: (dbUser as { timelineRangeTo?: Date | null })?.timelineRangeTo?.toISOString() || null,
            accentColor: (dbUser as { accentColor?: string })?.accentColor || '#3b82f6',
          }}
          repos={(dbUser?.repos || []).map(repo => ({
            id: repo.id,
            name: repo.name,
            isPrivate: repo.isPrivate,
            isVisible: repo.isVisible,
            description: repo.description,
            stars: repo.stars
          }))}
          workHistory={(dbUser?.workHistory || []).map(work => ({
            id: work.id,
            title: work.title,
            company: work.company,
            startDate: work.startDate,
            endDate: work.endDate,
            bullets: work.bullets
          }))}
        />
      </div>
    </div>
  )
}
