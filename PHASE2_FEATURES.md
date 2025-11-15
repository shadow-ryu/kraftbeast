# Phase 2 Features - Profile Enhancement

This phase adds real-world portfolio elements to KraftBeast, transforming it into a complete developer portfolio platform.

## New Features

### 1. Hero Section
- Displays user's name and bio at the top of the portfolio
- Editable from the dashboard profile page

### 2. Work History Section
- Add/edit/delete work experience entries
- Each entry includes:
  - Job title
  - Company name
  - Date range (start - end/present)
  - Up to 3 bullet points describing responsibilities
- Managed from `/dashboard/profile`

### 3. Activity Timeline (War Timeline)
- Chronological list of GitHub activity
- Shows recent commits with:
  - Repository name
  - Commit message
  - Timestamp
- Automatically populated by GitHub webhook on push events
- Displays latest 20 entries on portfolio

### 4. Contact Form
- Visitors can send messages directly from portfolio
- Form includes: name, email, message
- Messages forwarded to user's configured email
- Only visible if user has set a forward email

### 5. Social Links
- GitHub link (existing)
- Twitter/X handle (new)
- Configurable from profile settings

### 6. Enhanced Dashboard
- New "Edit Profile" button
- Profile page at `/dashboard/profile` with:
  - Bio editor
  - Twitter handle input
  - Forward email configuration
  - Work history manager

## Database Changes

### New Tables
- `WorkHistory` - stores work experience entries
- `Timeline` - stores GitHub activity/commits

### Updated User Model
- `bio` - short bio text
- `twitterHandle` - Twitter username
- `forwardEmail` - email for contact form forwarding

## API Endpoints

### `/api/user`
- `GET` - fetch user profile with work history
- `PATCH` - update bio, twitter, forward email

### `/api/work-history`
- `GET` - fetch all work history entries
- `POST` - create new work history entry

### `/api/work-history/[id]`
- `PATCH` - update work history entry
- `DELETE` - delete work history entry

### `/api/timeline`
- `GET` - fetch timeline entries for a user (query param: username)

### `/api/contact`
- `POST` - send contact form message

## Updated Webhook

The GitHub webhook (`/api/webhook/github`) now:
- Creates timeline entries for each commit in a push event
- Stores: repo name, commit message, timestamp

## UI Components

### New Components
- `ContactForm` - client-side contact form
- `ProfileForm` - edit bio, twitter, forward email
- `WorkHistoryManager` - add/edit/delete work history
- `Label` - form label component
- `Textarea` - multi-line text input

## Usage

1. **Setup Profile**
   - Go to `/dashboard/profile`
   - Add bio, Twitter handle, and forward email
   - Add work history entries

2. **View Portfolio**
   - Visit `/{username}` to see the updated portfolio
   - Hero section shows at the top
   - Work history appears before projects
   - Activity timeline shows recent commits
   - Contact form appears at bottom (if forward email set)

3. **Automatic Updates**
   - Push to GitHub → webhook creates timeline entries
   - Timeline automatically appears on portfolio
   - No manual updates needed

## Next Steps (Not Implemented)

- Email service integration (currently logs to console)
- Drag-and-drop reordering for work history
- Timeline filtering/pagination
- Rich text editor for bio
- More social links (LinkedIn, personal website)
