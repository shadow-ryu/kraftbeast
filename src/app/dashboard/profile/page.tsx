import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ExternalLink, ArrowLeft } from 'lucide-react'
import ProfileForm from '@/components/profile-form'
import WorkHistoryManager from '@/components/work-history-manager'
import { ThemeToggle } from '@/components/theme-toggle'

export default async function ProfilePage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await currentUser()
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let dbUser: any = await (prisma.user.findUnique as any)({
    where: { clerkId: userId },
    include: { 
      workHistory: { orderBy: { order: 'asc' } }
    }
  })

  if (!dbUser && user?.emailAddresses[0]?.emailAddress) {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dbUser = await (prisma.user.create as any)({
      data: {
        clerkId: userId,
        email: user.emailAddresses[0].emailAddress,
        name: fullName,
        avatarUrl: user.imageUrl,
      },
      include: { workHistory: { orderBy: { order: 'asc' } } }
    })
  }

  const portfolioUrl = dbUser?.githubHandle 
    ? `${process.env.NEXT_PUBLIC_APP_URL}/${dbUser.githubHandle}`
    : null

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
            {portfolioUrl && dbUser?.githubHandle && (
              <Link href={`/${dbUser.githubHandle}`} target="_blank">
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Portfolio
                </Button>
              </Link>
            )}
            <Link href="/dashboard/settings">
              <Button variant="outline" size="sm">
                Settings
              </Button>
            </Link>
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
        <h1 className="text-3xl font-bold mb-8">Edit Profile</h1>
        
        <div className="space-y-8">
          <ProfileForm 
            name={dbUser?.name || ''}
            bio={dbUser?.bio || ''}
            twitterHandle={dbUser?.twitterHandle || ''}
            linkedinUrl={dbUser?.linkedinUrl || ''}
            forwardEmail={dbUser?.forwardEmail || ''}
          />
          
          <WorkHistoryManager 
            workHistory={dbUser?.workHistory || []}
          />
        </div>
      </div>
    </div>
  )
}
