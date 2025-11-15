import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Github, Zap, RefreshCw, Eye } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6" />
            <span className="font-bold text-xl">KraftBeast</span>
          </div>
          <div className="flex gap-4">
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold mb-6">
          Your Portfolio Updates Itself<br />
          <span className="text-neutral-600">— So You Can Too</span>
        </h1>
        <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
          Stop wasting time maintaining your portfolio. Connect GitHub once, and every push automatically creates a project card. No rebuilding, no design, no friction.
        </p>
        <Link href="/sign-up">
          <Button size="lg" className="text-lg px-8 py-6">
            <Github className="mr-2 h-5 w-5" />
            Build Your Beast Page
          </Button>
        </Link>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-6">
            <Github className="h-12 w-12 mb-4 text-neutral-700" />
            <h3 className="text-xl font-semibold mb-2">Connect GitHub</h3>
            <p className="text-neutral-600">
              One-click OAuth integration. We fetch all your repos automatically.
            </p>
          </Card>
          
          <Card className="p-6">
            <RefreshCw className="h-12 w-12 mb-4 text-neutral-700" />
            <h3 className="text-xl font-semibold mb-2">Auto-Sync</h3>
            <p className="text-neutral-600">
              Every push triggers a webhook. Your portfolio updates in real-time.
            </p>
          </Card>
          
          <Card className="p-6">
            <Eye className="h-12 w-12 mb-4 text-neutral-700" />
            <h3 className="text-xl font-semibold mb-2">Track Visits</h3>
            <p className="text-neutral-600">
              See how many people view your portfolio. Simple analytics built-in.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Build Your Beast?</h2>
        <p className="text-neutral-600 mb-8">Join developers who never update portfolios manually again.</p>
        <Link href="/sign-up">
          <Button size="lg">
            Get Started Free
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="container mx-auto px-4 text-center text-neutral-600">
          <p>© 2024 KraftBeast. Built for developers who ship.</p>
        </div>
      </footer>
    </div>
  )
}
