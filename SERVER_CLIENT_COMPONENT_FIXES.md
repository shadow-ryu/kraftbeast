# Server/Client Component Fixes

## Issue
Error: "Event handlers cannot be passed to Client Component props"

This error occurs when trying to pass event handlers (like `onClick`) from Server Components to Client Components in Next.js 13+.

## Root Cause
- Server Components cannot pass functions (including event handlers) to Client Components
- All interactive components must be Client Components (marked with `'use client'`)
- Data passed from Server to Client Components must be serializable (no Date objects, functions, etc.)

## Fixes Applied

### 1. Button Component (`src/components/ui/button.tsx`)
**Problem:** Button component wasn't marked as Client Component
**Solution:** Added `'use client'` directive at the top

### 2. Dashboard Page (`src/app/dashboard/page.tsx`)
**Problem:** Server Component trying to pass onClick handler to Button
**Solution:** Created separate Client Component `GitHubConnectButton`

### 3. Settings Page (`src/app/dashboard/settings/page.tsx`)
**Problems:**
- Passing Date objects from Server to Client Component
- Passing full Prisma objects with metadata

**Solutions:**
- Converted Date objects to ISO strings using `.toISOString()`
- Explicitly mapped repos array to only include serializable fields
- Updated TypeScript interfaces to expect strings instead of Dates

### 4. Settings Content (`src/components/settings-content.tsx`)
**Problem:** Incorrect use of useState for initialization
**Solution:** Changed to `React.useEffect` for proper initialization

## New Components Created

### `src/components/github-connect-button.tsx`
Client Component that handles GitHub App installation button with onClick handler.

```tsx
'use client'

import { Button } from '@/components/ui/button'
import { Github } from 'lucide-react'

export function GitHubConnectButton() {
  return (
    <Button 
      size="lg"
      onClick={() => window.location.href = '/api/auth/github/app/install'}
    >
      <Github className="h-5 w-5 mr-2" />
      Install GitHub App
    </Button>
  )
}
```

## Best Practices Going Forward

### 1. Mark Interactive Components as Client Components
Any component that uses:
- Event handlers (`onClick`, `onChange`, etc.)
- React hooks (`useState`, `useEffect`, etc.)
- Browser APIs (`window`, `document`, etc.)

Must have `'use client'` at the top.

### 2. Serialize Data from Server to Client
When passing data from Server Components to Client Components:
- Convert Date objects to strings: `date.toISOString()`
- Remove functions and non-serializable data
- Only pass plain objects with primitive values

### 3. Extract Interactive Parts
If a Server Component needs interactivity:
- Extract the interactive part into a separate Client Component
- Keep the Server Component for data fetching
- Pass serialized data as props

### 4. Component Organization
```
Server Component (page.tsx)
  ├─ Fetch data from database
  ├─ Serialize data (dates → strings)
  └─ Pass to Client Component
      └─ Client Component (component.tsx)
          ├─ 'use client' directive
          ├─ Handle user interactions
          └─ Manage local state
```

## Files Modified

1. `src/components/ui/button.tsx` - Added 'use client'
2. `src/app/dashboard/page.tsx` - Extracted button to Client Component
3. `src/app/dashboard/settings/page.tsx` - Serialized data properly
4. `src/components/settings-content.tsx` - Fixed initialization logic
5. `src/components/github-connect-button.tsx` - New Client Component

## Verification

Build completes successfully:
```bash
npm run build
# ✓ Compiled successfully
```

All TypeScript errors resolved.
All runtime errors fixed.
