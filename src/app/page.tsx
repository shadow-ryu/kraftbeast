'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'
import { Github, Star, GitBranch, FileText, Lock, Palette, Mail, Code2, Zap } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-900 to-black text-white">
      {/* Header */}
      <header className="border-b border-neutral-800 backdrop-blur-sm bg-black/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center max-w-6xl">
          <div className="flex items-center gap-2">
            <Code2 className="h-6 w-6 text-[#00ff88]" />
            <span className="font-bold text-xl">KraftBeast</span>
          </div>
          <div className="flex gap-4 items-center">
            <ThemeToggle />
            <Link href="/sign-up">
              <Button className="bg-[#00ff88] text-black hover:bg-[#00dd77] font-semibold">
                Try Hosted Version
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 py-20 md:py-32">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
            Your portfolio updates itself.
          </h1>
          <p className="text-xl md:text-2xl text-neutral-400 mb-10 max-w-3xl mx-auto leading-relaxed">
            Connect your GitHub → skip the rebuilds → share your live profile in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/sign-up">
              <Button 
                size="lg" 
                className="bg-[#00ff88] text-black hover:bg-[#00dd77] text-lg px-8 py-6 rounded-lg font-semibold"
              >
                Try the Hosted Version
              </Button>
            </Link>
            <a href="https://github.com/shadow-ryu/kraftbeast" target="_blank" rel="noopener noreferrer">
              <Button 
                size="lg" 
                variant="outline"
                className="border-neutral-700 text-black dark:text-white hover:bg-neutral-800 text-lg px-8 py-6 rounded-lg font-semibold flex items-center gap-2"
              >
                <Github className="h-5 w-5" />
                View on GitHub
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="py-20 px-4 bg-neutral-950/50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">What You Get</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-neutral-900 border-neutral-800 p-8 hover:border-[#00ff88] transition-colors">
              <GitBranch className="h-10 w-10 text-[#00ff88] mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-white">Auto-Sync GitHub Repos</h3>
              <p className="text-neutral-400 leading-relaxed">
                Your code pushes automatically show up.
              </p>
            </Card>

            <Card className="bg-neutral-900 border-neutral-800 p-8 hover:border-[#00ff88] transition-colors">
              <FileText className="h-10 w-10 text-[#00ff88] mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-white">Work History Manager</h3>
              <p className="text-neutral-400 leading-relaxed">
                Add your jobs, bullet points, reorder with drag-and-drop.
              </p>
            </Card>

            <Card className="bg-neutral-900 border-neutral-800 p-8 hover:border-[#00ff88] transition-colors">
              <Zap className="h-10 w-10 text-[#00ff88] mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-white">Ship Timeline</h3>
              <p className="text-neutral-400 leading-relaxed">
                See your recent commits in a clean, vertical feed.
              </p>
            </Card>

            <Card className="bg-neutral-900 border-neutral-800 p-8 hover:border-[#00ff88] transition-colors">
              <Lock className="h-10 w-10 text-[#00ff88] mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-white">Private + Forked Repo Support</h3>
              <p className="text-neutral-400 leading-relaxed">
                Hide what you want. Badge what&apos;s cloned.
              </p>
            </Card>

            <Card className="bg-neutral-900 border-neutral-800 p-8 hover:border-[#00ff88] transition-colors">
              <Code2 className="h-10 w-10 text-[#00ff88] mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-white">Full Markdown + File Browser</h3>
              <p className="text-neutral-400 leading-relaxed">
                Readmes render cleanly. Browse private repo files.
              </p>
            </Card>

            <Card className="bg-neutral-900 border-neutral-800 p-8 hover:border-[#00ff88] transition-colors">
              <Palette className="h-10 w-10 text-[#00ff88] mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-white">Brand Customisation</h3>
              <p className="text-neutral-400 leading-relaxed">
                Pick your accent color. Dark mode ready.
              </p>
            </Card>

            <Card className="bg-neutral-900 border-neutral-800 p-8 hover:border-[#00ff88] transition-colors">
              <Mail className="h-10 w-10 text-[#00ff88] mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-white">Contact Form</h3>
              <p className="text-neutral-400 leading-relaxed">
                Enable contact when you enter your Resend API key — visitors can send you messages.
              </p>
            </Card>

            <Card className="bg-neutral-900 border-neutral-800 p-8 hover:border-[#00ff88] transition-colors">
              <Github className="h-10 w-10 text-[#00ff88] mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-white">Open Source Core</h3>
              <p className="text-neutral-400 leading-relaxed">
                Fork it. Modify it. Self-host if you like.
              </p>
            </Card>

            <Card className="bg-neutral-900 border-neutral-800 p-8 hover:border-[#00ff88] transition-colors">
              <Star className="h-10 w-10 text-[#00ff88] mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-white">Hosted Version Available</h3>
              <p className="text-neutral-400 leading-relaxed">
                No install. Just point, connect, and go.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Open Source Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-12">
            <Github className="h-16 w-16 text-[#00ff88] mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">KraftBeast is 100% open source.</h2>
            <p className="text-xl text-neutral-400 mb-8">
              Built by developers, for developers.
            </p>
            <a href="https://github.com/shadow-ryu/kraftbeast" target="_blank" rel="noopener noreferrer">
              <Button 
                size="lg"
                className="bg-[#00ff88] text-black hover:bg-[#00dd77] font-semibold flex items-center gap-2 mx-auto"
              >
                <Star className="h-5 w-5" />
                Star it on GitHub
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Why It Matters Section */}
      <section className="py-20 px-4 bg-neutral-950/50">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">Why It Matters</h2>
          <p className="text-xl text-neutral-400 leading-relaxed mb-6">
            Developers build great stuff but rarely update their portfolios.
          </p>
          <p className="text-xl text-neutral-400 leading-relaxed mb-6">
            KraftBeast takes that burden off your plate — you ship code, we show it.
          </p>
          <p className="text-2xl font-semibold text-[#00ff88]">
            No manual pushes. No static sites. No rebuild workflows.
          </p>
        </div>
      </section>

      {/* Get Started Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">Get Started</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-[#00ff88] text-black rounded-full flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Click &quot;Try the Hosted Version&quot;</h3>
                <p className="text-neutral-400">Sign up in seconds with your email.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-[#00ff88] text-black rounded-full flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Connect your GitHub App</h3>
                <p className="text-neutral-400">Read-only access. We never write to your repos.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-[#00ff88] text-black rounded-full flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Set up your profile</h3>
                <p className="text-neutral-400">Add work history, pick your accent color.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-[#00ff88] text-black rounded-full flex items-center justify-center font-bold text-xl">
                4
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Share your custom URL</h3>
                <p className="text-neutral-400">kraftbeast.com/[your-username]</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/sign-up">
              <Button 
                size="lg" 
                className="bg-[#00ff88] text-black hover:bg-[#00dd77] text-xl px-12 py-6 rounded-lg font-semibold"
              >
                Get Started Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-neutral-400">
              <p>© 2025 KraftBeast — Built by developers, for developers</p>
            </div>
            <div className="flex gap-6 items-center">
              <a 
                href="https://x.com/shadow_ryuga" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-neutral-400 hover:text-[#00ff88] transition-colors flex items-center gap-2"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Twitter
              </a>
              <a 
                href="https://github.com/shadow-ryu/kraftbeast" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#00ff88] hover:text-[#00dd77] transition-colors flex items-center gap-2 font-semibold"
              >
                <Star className="h-5 w-5" />
                Star on GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
