
# Less — Full MVP Plan

## Brand & Design System
- Light blue palette matching the uploaded logo (soft blue backgrounds, white accents)
- Clean, minimalist typography with generous whitespace
- Copy the uploaded logo into the project as the app icon
- PWA setup with manifest, icons, and install prompt page

## Pages & Navigation

### 1. Landing Page (`/`)
- Hero section with logo, tagline ("Less noise. More proof."), and CTA buttons (Sign Up / Log In)
- "How it works" section with 3-step visual explanation
- "Why Less exists" manifesto section
- Footer with links

### 2. Auth Pages (`/login`, `/signup`)
- Email & password authentication via Supabase (Lovable Cloud)
- Clean, minimal auth forms matching the brand

### 3. Profile Builder (`/profile/edit`)
- Upload grid: 5 video slots + 5 image slots
- Each slot shows upload state, preview, and delete option
- Profile fields: name, title/role, bio, location, contact link
- Media stored in Supabase Storage

### 4. Public Profile View (`/profile/:username`)
- Clean portfolio layout showing the 10 media pieces
- User info header with name, role, bio
- Action buttons: Book Session, Commission Work, Contact
- Shareable URL for use as a visual CV

### 5. Discover/Browse Page (`/discover`)
- Grid of creator profiles with thumbnail previews
- Filter by category (artist, educator, coach, designer, etc.)
- Search by name or skill
- No infinite scroll — paginated, intentional browsing

### 6. Install PWA Page (`/install`)
- Instructions for adding to home screen
- Platform-specific guidance (iOS vs Android)

## Backend (Supabase / Lovable Cloud)
- **Auth**: Email/password signup and login
- **Database tables**: profiles, media_items (with type: video/image, order, URL), categories, bookings/transactions
- **Storage**: Buckets for user media (images + videos)
- **RLS policies**: Users can only edit their own profile/media; public read access for published profiles
- **5% transaction fee**: Tracked in transactions table

## Core Features
- Enforce the 5+5 media limit (5 videos, 5 images max)
- Drag-to-reorder media within the profile
- Video playback inline on profile pages
- Responsive mobile-first design (PWA-ready)
- Category tags for discoverability

## PWA Configuration
- Web app manifest with Less branding and light blue theme
- Conditional service worker registration (disabled in Lovable preview/iframes)
- Installable from browser on both iOS and Android
