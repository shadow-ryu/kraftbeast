# Dark Mode Implementation

KraftBeast now supports automatic and manual dark mode switching with minimal, aesthetic design.

## Features

✅ **System-aware detection** - Automatically detects `prefers-color-scheme` media query  
✅ **Manual toggle** - Sun/Moon icon toggle in top-right corner of all pages  
✅ **Persistent preference** - Stores user choice in localStorage  
✅ **Smooth transitions** - Instant theme switching without page reload  
✅ **Minimal design** - Uses existing Tailwind + shadcn/ui tokens  

## Implementation

### Theme Provider
- Uses `next-themes` for theme management
- Wraps entire app in `src/app/layout.tsx`
- Supports `light`, `dark`, and `system` modes
- Default: `system` (auto-detects user preference)

### Theme Toggle Component
- Located at `src/components/theme-toggle.tsx`
- Displays Sun icon in dark mode, Moon icon in light mode
- Added to all major pages:
  - Dashboard (`/dashboard`)
  - Profile (`/dashboard/profile`)
  - Settings (`/dashboard/settings`)
  - Portfolio (`/[username]`)
  - Home page (`/`)

### Color Tokens
Dark mode tokens are defined in `src/app/globals.css`:

```css
.dark {
  --background: oklch(0.145 0 0);      /* #0d0d0d equivalent */
  --foreground: oklch(0.985 0 0);      /* Near white */
  --card: oklch(0.205 0 0);            /* #1a1a1a equivalent */
  --muted: oklch(0.269 0 0);           /* Muted gray */
  /* ... and more */
}
```

### Ship Timeline
The Ship Timeline section maintains its dark aesthetic in both modes:
- Light mode: `bg-neutral-900`
- Dark mode: `bg-[#0d0d0d]`
- Neon green accent (`#00ff88`) preserved in both modes

## Usage

Users can:
1. **Auto-detect**: Theme automatically matches system preference
2. **Manual toggle**: Click Sun/Moon icon to switch themes
3. **Persistent**: Choice is saved and restored on next visit

## Technical Details

- **Package**: `next-themes` (69 packages, 0 vulnerabilities)
- **Strategy**: Class-based (`darkMode: ['class']`)
- **Hydration**: Uses `suppressHydrationWarning` on `<html>` tag
- **Transitions**: Disabled on change for instant switching

## Files Modified

- `src/app/layout.tsx` - Added ThemeProvider wrapper
- `src/app/globals.css` - Dark mode tokens already present
- `src/components/theme-toggle.tsx` - New toggle component
- `src/components/theme-provider.tsx` - New provider wrapper
- All page files - Added ThemeToggle component and updated bg classes

## Design Philosophy

- **Minimal**: No heavy theming or gradient noise
- **Automatic**: Works out of the box with system preference
- **Aesthetic**: Maintains indie, crisp design in both modes
- **Non-invasive**: No component structure changes required
