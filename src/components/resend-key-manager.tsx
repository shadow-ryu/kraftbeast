'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, Eye, EyeOff, ExternalLink, Trash2 } from 'lucide-react'

export default function ResendKeyManager() {
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [hasKey, setHasKey] = useState(false)
  const [maskedKey, setMaskedKey] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Load current key status
  useEffect(() => {
    loadKeyStatus()
  }, [])

  const loadKeyStatus = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/settings/resend-key')
      if (response.ok) {
        const data = await response.json()
        setHasKey(data.hasKey)
        setMaskedKey(data.maskedKey)
      }
    } catch (error) {
      console.error('Error loading key status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveKey = async () => {
    if (!apiKey.trim()) {
      setMessage({ type: 'error', text: 'Please enter an API key' })
      return
    }

    setIsSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/settings/resend-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resendApiKey: apiKey })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: 'Resend API key saved successfully!' })
        setHasKey(true)
        setMaskedKey(data.maskedKey)
        setApiKey('')
        setShowKey(false)
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save API key' })
      }
    } catch (error) {
      console.error('Error saving key:', error)
      setMessage({ type: 'error', text: 'An error occurred while saving' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteKey = async () => {
    if (!confirm('Are you sure you want to remove your Resend API key? This will disable the contact form on your portfolio.')) {
      return
    }

    setIsDeleting(true)
    setMessage(null)

    try {
      const response = await fetch('/api/settings/resend-key', {
        method: 'DELETE'
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Resend API key removed successfully' })
        setHasKey(false)
        setMaskedKey(null)
        setApiKey('')
      } else {
        const data = await response.json()
        setMessage({ type: 'error', text: data.error || 'Failed to remove API key' })
      }
    } catch (error) {
      console.error('Error deleting key:', error)
      setMessage({ type: 'error', text: 'An error occurred while removing' })
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-neutral-200 rounded w-1/4 mb-2"></div>
          <div className="h-10 bg-neutral-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Current Status */}
      {hasKey && maskedKey && (
        <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-900">Contact Form Enabled</span>
            </div>
            <Badge variant="default" className="bg-green-600">Active</Badge>
          </div>
          <p className="text-sm text-green-700 mb-2">
            Your Resend API key is configured: <code className="bg-green-100 px-2 py-1 rounded">{maskedKey}</code>
          </p>
          <p className="text-xs text-green-600">
            Visitors can now contact you through your portfolio. Messages will be forwarded to your configured email.
          </p>
        </div>
      )}

      {!hasKey && (
        <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="h-5 w-5 text-yellow-600" />
            <span className="font-medium text-yellow-900">Contact Form Disabled</span>
          </div>
          <p className="text-sm text-yellow-700">
            Add your Resend API key to enable the contact form on your portfolio.
          </p>
        </div>
      )}

      {/* API Key Input */}
      <div>
        <Label htmlFor="resendApiKey">
          {hasKey ? 'Update Resend API Key' : 'Resend API Key'}
        </Label>
        <p className="text-sm text-neutral-600 mb-3">
          Get your API key from{' '}
          <a 
            href="https://resend.com/api-keys" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline inline-flex items-center gap-1"
          >
            resend.com/api-keys
            <ExternalLink className="h-3 w-3" />
          </a>
          {' '}(100 emails/day free)
        </p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              id="resendApiKey"
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="re_xxxxxxxxxxxx"
              disabled={isSaving}
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <Button 
            onClick={handleSaveKey}
            disabled={isSaving || !apiKey.trim()}
          >
            {isSaving ? 'Saving...' : hasKey ? 'Update' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Delete Button */}
      {hasKey && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleDeleteKey}
          disabled={isDeleting}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          {isDeleting ? 'Removing...' : 'Remove API Key'}
        </Button>
      )}

      {/* Status Message */}
      {message && (
        <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {message.text}
        </p>
      )}

      {/* Security Notice */}
      <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
        <p className="text-xs text-neutral-600">
          🔒 <strong>Security:</strong> Your API key is encrypted using AES-256-GCM before storage and only decrypted when sending emails. It never leaves the server once stored.
        </p>
      </div>
    </div>
  )
}
