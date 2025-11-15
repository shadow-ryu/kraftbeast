import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { UserX } from 'lucide-react'

export default function PortfolioNotFound() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <Card className="p-12 text-center max-w-md">
        <UserX className="h-16 w-16 mx-auto mb-4 text-neutral-400" />
        <h1 className="text-2xl font-bold mb-2">Portfolio Not Found</h1>
        <p className="text-neutral-600 mb-6">
          This user doesn't exist or hasn't set up their KraftBeast portfolio yet.
        </p>
        <Link href="/">
          <Button>Go Home</Button>
        </Link>
      </Card>
    </div>
  )
}
