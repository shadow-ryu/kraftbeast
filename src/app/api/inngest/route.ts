import { serve } from 'inngest/next'
import { inngest } from '@/lib/inngest'
import { syncReposJob } from '@/inngest/sync-repos'

// Create an API route that serves Inngest functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    syncReposJob,
  ],
})
