import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ExternalLink, ArrowLeft } from 'lucide-react'
import ProfileForm from '@/components/profile-form'
import WorkHistoryManager from '@/components/work-history-manager'

export default async function ProfilePage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await currentUser()
  
  let dbUser = await prisma.user.findUnique({
    where: { email: user?.emailAddresses[0]?.emailAddress },
    include: { 
      workHistory: { orderBy: { order: 'asc' } }
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
      include: { workHistory: { orderBy: { order: 'asc' } } }
    })
  }

  const portfolioUrl = dbUser?.githubHandle 
    ? `${process.env.NEXT_PUBLIC_APP_URL}/${dbUser.githubHandle}`
    : null

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
            {portfolioUrl && dbUser?.githubHandle && (
              <Link href={`/${dbUser.githubHandle}`} target="_blank">
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Portfolio
                </Button>
              </Link>
            )}
            <img 
              src={user?.imageUrl} 
              alt={user?.firstName || 'User'} 
              className="h-8 w-8 rounded-full"
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
