import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="text-center">
        <FileQuestion className="h-24 w-24 mx-auto mb-6 text-neutral-400" />
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <p className="text-xl text-neutral-600 mb-8">Page not found</p>
        <Link href="/">
          <Button size="lg">Go Home</Button>
        </Link>
      </div>
    </div>
  )
}
