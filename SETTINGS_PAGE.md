# Settings Page Implementation

## Overview
Created a unified Settings page at `/dashboard/settings` that consolidates all user preferences, integrations, and repository visibility controls.

## What Was Built

### 1. New Route: `/dashboard/settings`
- **File**: `src/app/dashboard/settings/page.tsx`
- Server-side page that fetches user data and repos
- Passes data to client component for interactivity

### 2. Settings Content Component
- **File**: `src/components/settings-content.tsx`
- Client-side component with four main sections:
  - Repository Visibility
  - Integrations
  - Contact & Social
  - Danger Zone

### 3. Repository Visibility Section
- **Fixed**: Both public AND private repos can now be toggled visible/invisible
- Displays repos grouped by type (Public/Private)
- Each repo has a Switch toggle to control visibility
- Uses existing `/api/repos/[repoId]/visibility` endpoint

### 4. Integrations Section
Shows connection status for:
- **GitHub**: Connected/Not Connected with Reconnect button
- **LinkedIn**: Placeholder (Coming Soon)
- **Twitter/X**: Shows if handle is added

### 5. Contact & Social Section
- Twitter handle input field
- Forward email input field
- Save button to persist changes
- Uses new `/api/user/settings` endpoint

### 6. Danger Zone
- Placeholder for "Disconnect GitHub & Clear Data" button
- Marked as "Coming Soon"

## Database Changes

### Schema Updates
Added `linkedinUrl` field to User model:
```prisma
model User {
  // ... existing fields
  twitterHandle   String?
  linkedinUrl     String?  // NEW
  forwardEmail    String?
  // ... rest of fields
}
```

### Migration
- Created migration: `20251115113921_add_linkedin_url`
- Adds `linkedinUrl` column to users table

## API Endpoints

### New Endpoint: `/api/user/settings`
- **Method**: PATCH
- **Purpose**: Update user settings (twitterHandle, forwardEmail)
- **File**: `src/app/api/user/settings/route.ts`

### Existing Endpoint (Used): `/api/repos/[repoId]/visibility`
- **Method**: PATCH
- **Purpose**: Toggle repo visibility
- **File**: `src/app/api/repos/[repoId]/visibility/route.ts`

## UI Components

### New Component: Switch
- **File**: `src/components/ui/switch.tsx`
- Radix UI switch component for toggle controls
- Used for repo visibility toggles

## Key Fixes

### Portfolio Visibility Logic
**Before**: Only showed repos with `isPrivate: false AND isVisible: true`
```typescript
repos: { 
  where: { 
    isPrivate: false,
    isVisible: true 
  }
}
```

**After**: Shows ALL repos with `isVisible: true` (regardless of privacy)
```typescript
repos: { 
  where: { 
    isVisible: true 
  }
}
```

This fix is in `src/app/[username]/page.tsx`

## Navigation Updates

### Dashboard Page
- Added "Settings" button next to "Edit Profile"
- **File**: `src/app/dashboard/page.tsx`

### Profile Page
- Added "Settings" button in header
- **File**: `src/app/dashboard/profile/page.tsx`

## How It Works

### Repository Visibility Flow
1. User goes to `/dashboard/settings`
2. Sees all repos (public + private) grouped by type
3. Toggles Switch for any repo
4. PATCH request to `/api/repos/[repoId]/visibility`
5. Database updates `isVisible` field
6. Portfolio page respects this flag

### Settings Update Flow
1. User edits Twitter handle or forward email
2. Clicks "Save Settings"
3. PATCH request to `/api/user/settings`
4. Database updates user record
5. Success message shown

## Testing Checklist

- [ ] Navigate to `/dashboard/settings`
- [ ] Toggle public repo visibility
- [ ] Toggle private repo visibility
- [ ] Check portfolio - only visible repos show
- [ ] Update Twitter handle
- [ ] Update forward email
- [ ] Save settings
- [ ] Verify changes persist
- [ ] Check GitHub connection status
- [ ] Test Reconnect button

## Future Enhancements (Not Implemented)

1. **LinkedIn Integration**
   - OAuth connection flow
   - Profile verification
   - Display LinkedIn badge on portfolio

2. **Disconnect GitHub**
   - Clear all synced repos
   - Remove GitHub token
   - Reset connection status

3. **Bulk Visibility Controls**
   - "Show All" / "Hide All" buttons
   - Filter by language or stars
   - Repo pinning/ordering

## Dependencies Added

- `@radix-ui/react-switch` - For toggle switches
