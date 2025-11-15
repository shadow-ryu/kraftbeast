'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const [cursorVisible, setCursorVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible(prev => !prev)
    }, 530)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-[#1a1a1a]">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center max-w-[1200px]">
          <span className="font-bold text-xl">KraftBeast</span>
          <div className="flex gap-4">
            <Link href="/sign-in">
              <Button variant="ghost" className="text-white hover:text-[#00ff88]">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button className="bg-[#00ff88] text-black hover:bg-[#00dd77] font-semibold">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - Full viewport height */}
      <section className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
          Ship Proof Portfolios
        </h1>
        <p className="text-xl md:text-2xl text-[#a0a0a0] mb-8 max-w-3xl leading-relaxed">
          Connect GitHub. Pushes auto-carve your timeline. No manual BS. Recruiters see real momentum, not stale links.
        </p>
        <Link href="/sign-up">
          <Button 
            size="lg" 
            className="bg-[#00ff88] text-black hover:bg-[#00dd77] text-xl px-12 py-6 rounded-lg font-semibold"
          >
            Connect Repo Free
          </Button>
        </Link>
        <div className="mt-8 text-[#a0a0a0] font-mono">
          <span className={cursorVisible ? 'opacity-100' : 'opacity-0'}>▊</span>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-[1200px]">
          <h2 className="text-4xl font-bold text-center mb-12">What You Get</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-[#1a1a1a] border-[#1a1a1a] p-8 rounded-md shadow-lg">
              <h3 className="text-xl font-semibold mb-3 text-white">Auto-Timeline</h3>
              <p className="text-[#a0a0a0] leading-relaxed">
                Every push adds a dated scar. No rebuilds.
              </p>
            </Card>
            
            <Card className="bg-[#1a1a1a] border-[#1a1a1a] p-8 rounded-md shadow-lg">
              <h3 className="text-xl font-semibold mb-3 text-white">Work History</h3>
              <p className="text-[#a0a0a0] leading-relaxed">
                Add roles + bullets. Chrono above ships.
              </p>
            </Card>
            
            <Card className="bg-[#1a1a1a] border-[#1a1a1a] p-8 rounded-md shadow-lg">
              <h3 className="text-xl font-semibold mb-3 text-white">Contact Form</h3>
              <p className="text-[#a0a0a0] leading-relaxed">
                One-click reach-outs. Forward to your email.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20 px-4 bg-[#0a0a0a]">
        <div className="container mx-auto max-w-[1200px]">
          <h2 className="text-4xl font-bold text-center mb-12">See It Breathe</h2>
          <div className="max-w-2xl mx-auto bg-[#1a1a1a] rounded-md p-8 font-mono text-sm overflow-auto max-h-[50vh]">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-1 h-full bg-[#00ff88]"></div>
                <div>
                  <div className="text-[#00ff88]">02:47 AM</div>
                  <div className="text-white">Pushed &quot;auth-v2&quot;</div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-1 h-full bg-[#00ff88]"></div>
                <div>
                  <div className="text-[#00ff88]">11:23 PM</div>
                  <div className="text-white">Shipped &quot;api-fix&quot;</div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-1 h-full bg-[#00ff88]"></div>
                <div>
                  <div className="text-[#00ff88]">03:15 PM</div>
                  <div className="text-white">Merged &quot;feature-dashboard&quot;</div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-1 h-full bg-[#00ff88]"></div>
                <div>
                  <div className="text-[#00ff88]">09:42 AM</div>
                  <div className="text-white">Deployed &quot;v2.1.0&quot;</div>
                </div>
              </div>
              <div className="text-center text-[#a0a0a0] py-4">...</div>
            </div>
          </div>
          <p className="text-center text-[#a0a0a0] mt-8 text-lg">
            Your ships here. Live. Raw.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a] py-8">
        <div className="container mx-auto px-4 text-center text-[#a0a0a0] max-w-[1200px]">
          <div className="flex justify-center gap-6 mb-4">
            <a href="#" className="text-[#00ff88] hover:underline">Docs</a>
            <a href="https://twitter.com/kraftbeast" target="_blank" rel="noopener noreferrer" className="text-[#00ff88] hover:underline">
              X (@kraftbeast)
            </a>
          </div>
          <p>© 2024 KraftBeast. Built for shippers.</p>
        </div>
      </footer>
    </div>
  )
}
