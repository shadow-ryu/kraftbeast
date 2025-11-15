# Repository Card Enhancements

## Overview
Enhanced repo cards with private badges, inline modals for private repos, file structure viewing, configurable default tabs, and multi-language display.

## What Was Built

### 1. Private Badge (👾)
- **Display**: Pac-Man pixel-monster emoji badge on all private repos
- **Location**: Portfolio cards and modal headers
- **Styling**: Consistent with existing badge system
- **Files**: 
  - `src/components/repo-card.tsx`
  - `src/components/repo-modal.tsx`

### 2. Click Behavior

#### Public Repos
- Click → Redirect to GitHub (existing behavior maintained)
- External link icon shown

#### Private Repos
- Click → Open inline modal (no redirect)
- "View Details" text shown instead of external link
- Modal displays three tabs: README, Files, Description

### 3. Repo Modal Component
**File**: `src/components/repo-modal.tsx`

Features:
- Full-screen overlay with centered modal
- Three-tab interface
- Responsive design
- Click outside to close
- Smooth transitions

#### Tab 1: README
- Fetches README from GitHub API
- Displays raw markdown content
- Fallback: "README not accessible" for repos without README
- API: `/api/repos/[repoId]/readme`

#### Tab 2: Files
- Fetches complete file tree from GitHub API
- Displays as collapsible nested structure
- Folder icons: 📁 (closed) / 📂 (open)
- File icon: 📄
- Top-level folders shown by default
- Click to expand/collapse folders
- API: `/api/repos/[repoId]/files`

#### Tab 3: Description
- Shows repo description
- Displays all languages as badges
- Shows stats (stars, commits)
- Shows last updated date

### 4. Multi-Language Display

#### Database Changes
Added `languages` JSON field to Repo model:
```prisma
model Repo {
  // ... existing fields
  language    String?  // Primary language (kept for backward compatibility)
  languages   Json?    // All languages with byte counts
  // ... rest of fields
}
```

#### Sync Enhancement
**File**: `src/app/api/github/sync/route.ts`

- Fetches languages from GitHub's `languages_url` for each repo
- Stores complete language data as JSON
- Example data: `{ "TypeScript": 12345, "JavaScript": 6789, "HTML": 234 }`
- Fetches commit count from GitHub's commits API
- Uses pagination headers to get accurate total count
- Updates commit count on every sync

#### Display Logic
**Files**: `src/components/repo-card.tsx`, `src/components/repo-modal.tsx`

- Extracts all language names from JSON
- Displays each as a badge
- Falls back to single `language` field if `languages` is null
- Shows "Unknown" if no language data available

### 5. User Default Tab Preference

#### Database Changes
Added `defaultRepoView` field to User model:
```prisma
model User {
  // ... existing fields
  defaultRepoView String @default("readme")
  // ... rest of fields
}
```

Options: `'readme'` | `'files'` | `'description'`

#### Settings UI
**File**: `src/components/settings-content.tsx`

Added dropdown in "Contact & Social" section:
- Label: "Default Private Repo View"
- Description: "Choose which tab opens first when viewing private repositories"
- Options: README, Files, Description
- Saves to database via `/api/user/settings`

#### Implementation
**File**: `src/app/[username]/page.tsx`

- Passes user's `defaultRepoView` to RepoCard component
- RepoCard passes it to RepoModal
- Modal opens to the configured tab

### 6. New API Endpoints

#### GET `/api/repos/[repoId]/readme`
**File**: `src/app/api/repos/[repoId]/readme/route.ts`

- Fetches README from GitHub API
- Uses user's GitHub token from database
- Returns raw markdown content
- Handles missing README gracefully

#### GET `/api/repos/[repoId]/files`
**File**: `src/app/api/repos/[repoId]/files/route.ts`

- Fetches file tree from GitHub API (recursive)
- Builds hierarchical tree structure from flat list
- Sorts folders before files
- Returns nested JSON structure

Example response:
```json
{
  "tree": [
    {
      "path": "src",
      "name": "src",
      "type": "tree",
      "children": [
        {
          "path": "src/index.ts",
          "name": "index.ts",
          "type": "blob"
        }
      ]
    }
  ]
}
```

### 7. Component Architecture

#### RepoCard Component
**File**: `src/components/repo-card.tsx`

Props:
- `repo`: Repository data
- `githubHandle`: Owner's GitHub username
- `defaultTab`: User's preferred default tab

Features:
- Handles click behavior (redirect vs modal)
- Displays private badge
- Shows all languages
- Manages modal state

#### RepoModal Component
**File**: `src/components/repo-modal.tsx`

Props:
- `isOpen`: Modal visibility state
- `onClose`: Close handler
- `repo`: Repository data
- `githubHandle`: Owner's GitHub username
- `defaultTab`: Initial tab to display

Features:
- Tab management
- Lazy loading (fetches data only when tab is opened)
- Loading states
- Error handling
- FileTree sub-component for nested file display

## Database Migrations

### Migration 1: `add_repo_languages_and_default_view`
- Added `languages` JSON field to Repo table
- Added `defaultRepoView` string field to User table (default: 'readme')

## Updated Files

### Modified
1. `prisma/schema.prisma` - Added fields
2. `src/app/[username]/page.tsx` - Uses RepoCard component
3. `src/app/api/github/sync/route.ts` - Fetches all languages
4. `src/components/settings-content.tsx` - Added default tab setting
5. `src/app/api/user/settings/route.ts` - Handles defaultRepoView
6. `src/app/dashboard/settings/page.tsx` - Passes defaultRepoView

### Created
1. `src/components/repo-card.tsx` - Unified repo card component
2. `src/components/repo-modal.tsx` - Modal with tabs
3. `src/app/api/repos/[repoId]/readme/route.ts` - README endpoint
4. `src/app/api/repos/[repoId]/files/route.ts` - File tree endpoint

## How It Works

### Public Repo Flow
1. User clicks public repo card
2. Browser redirects to GitHub URL
3. Opens in new tab

### Private Repo Flow
1. User clicks private repo card
2. Modal opens with user's default tab active
3. If README tab: Fetches and displays README
4. If Files tab: Fetches and displays file tree
5. If Description tab: Shows metadata
6. User can switch tabs (lazy loads data)
7. Click outside or X button to close

### Language Display Flow
1. During sync: Fetch languages from GitHub API
2. Store as JSON in database
3. On display: Extract language names
4. Render each as a badge

### Settings Flow
1. User goes to Settings page
2. Selects preferred default tab
3. Saves settings
4. Next time they view a private repo, it opens to that tab

## Testing Checklist

- [ ] Sync repos from GitHub
- [ ] Verify commit counts are populated (not 0)
- [ ] Public repo shows no private badge
- [ ] Private repo shows 👾 Private badge
- [ ] Click public repo → redirects to GitHub
- [ ] Click private repo → opens modal
- [ ] Modal README tab loads content
- [ ] Modal Files tab shows tree structure
- [ ] Folders expand/collapse correctly
- [ ] Modal Description tab shows all info
- [ ] All languages display as badges (not just one)
- [ ] Change default tab in settings
- [ ] Private repo opens to new default tab
- [ ] Modal closes on outside click
- [ ] Modal closes on X button
- [ ] Loading states show correctly
- [ ] Error states show correctly
- [ ] Push new commit → webhook updates commit count

## Future Enhancements (Not Implemented)

1. **Markdown Rendering**
   - Parse and render README markdown properly
   - Syntax highlighting for code blocks
   - Support for images and links

2. **File Content Viewing**
   - Click file to view contents
   - Syntax highlighting
   - Download option

3. **Search in Files**
   - Search file names
   - Filter by file type

4. **Repo Statistics**
   - Language breakdown chart
   - Commit history graph
   - Contributor list

5. **Caching**
   - Cache README and file structure
   - Reduce API calls
   - Faster load times

## Notes

- Private repos require valid GitHub token
- File tree limited to HEAD branch
- README fetched as raw text (not rendered)
- Languages data includes byte counts (not displayed)
- Modal uses fixed positioning for overlay
- Tree structure built recursively from flat list
