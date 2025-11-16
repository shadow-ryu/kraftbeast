# Markdown Rendering & Timeline Range Control

## Overview
This document describes the implementation of GitHub-style markdown rendering and timeline range control features for KraftBeast.

## Features Implemented

### 1. Markdown Rendering (GitHub-Style)

**What Changed:**
- Private repository README files now render with proper markdown formatting
- Supports GitHub Flavored Markdown (GFM) including tables, task lists, strikethrough, etc.
- Automatic dark/light mode support
- Sanitized HTML rendering for security

**Dependencies Added:**
```bash
npm install react-markdown remark-gfm rehype-raw rehype-sanitize
```

**Files Modified:**
- `src/components/repo-modal.tsx` - Updated README tab to use ReactMarkdown
- `src/app/globals.css` - Added custom typography styles for markdown

**Usage:**
- Open any private repository modal
- Click on the README tab
- Markdown content now renders with proper formatting, including:
  - Headings with borders
  - Code blocks with syntax highlighting
  - Tables with proper styling
  - Lists (ordered and unordered)
  - Links, images, blockquotes
  - Bold, italic, strikethrough text

### 2. Timeline Range Control

**What Changed:**
- Users can now control the visible timeline range on their portfolio
- Default range: Last 90 days
- Preset options: 7 days, 30 days, 90 days, or custom range
- Timeline displays date range information
- Empty state shows when no commits exist in selected period

**Database Changes:**
- Added `timelineRangeFrom` (DateTime, nullable) to User model
- Added `timelineRangeTo` (DateTime, nullable) to User model
- Migration: `20251116152838_add_timeline_range_fields`

**Files Modified:**
- `prisma/schema.prisma` - Added timeline range fields
- `src/app/api/timeline/route.ts` - Added date range filtering
- `src/app/api/user/settings/route.ts` - Added timeline range settings
- `src/app/[username]/page.tsx` - Applied timeline range filter
- `src/components/settings-content.tsx` - Added timeline range UI
- `src/app/dashboard/settings/page.tsx` - Pass timeline range data
- `src/components/ui/date-input.tsx` - Created date input component

**Usage:**

1. **Configure Timeline Range:**
   - Go to Dashboard → Settings
   - Scroll to "Timeline Range" section
   - Choose a preset (7, 30, or 90 days) or select "Custom Range"
   - For custom range, select start and end dates
   - Click "Save Timeline Range"

2. **View Timeline:**
   - Visit your portfolio page (`/[username]`)
   - Ship Timeline sidebar shows date range
   - Activity Timeline section displays commits within range
   - Date range is shown above the timeline: "Showing commits from [date] to [date]"

3. **Empty State:**
   - If no commits exist in the selected period, a friendly message appears
   - Shows the date range being filtered

## API Endpoints

### GET /api/timeline
Query parameters:
- `username` (required) - GitHub username
- `from` (optional) - Start date (ISO format)
- `to` (optional) - End date (ISO format)

Response:
```json
{
  "timeline": [...],
  "from": "2024-08-16T00:00:00.000Z",
  "to": "2024-11-16T00:00:00.000Z"
}
```

### PATCH /api/user/settings
Body parameters:
- `timelineRangeFrom` (optional) - Start date (ISO format)
- `timelineRangeTo` (optional) - End date (ISO format)
- Other existing settings...

## Dark Mode Support

Both features fully support dark mode:
- Markdown styles adapt to dark theme automatically
- Timeline UI uses theme-aware colors
- Date inputs respect system theme

## Performance Considerations

- Timeline queries are indexed on `userId` and `timestamp`
- Maximum 100 timeline entries returned per query
- Date range filtering happens at database level for efficiency

## Future Enhancements

Potential improvements:
- Add syntax highlighting for code blocks in markdown
- Export timeline data as CSV/JSON
- Timeline filtering by repository
- Timeline search functionality
- Markdown preview in settings
