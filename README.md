# KLIP - Short-Form Video Platform

A modern, TikTok-style short-form video sharing platform built with the T3 Stack, featuring seamless video playback, social interactions, and a beautiful mobile-first UI.

## 🎯 Features

### 📱 Video Experience
- **Automatic Infinite Scroll** - Continuously loads more videos as you scroll (TikTok-style)
- **Smart Autoplay** - Videos play automatically (muted initially), unmuting seamlessly on interaction
- **Seamless Audio** - Scrolling or tapping anywhere enables audio for the entire session
- **Auto-Play & Snap Scrolling** - Videos auto-play as you scroll with instant navigation
- **Double-Tap to Like** - Intuitive gesture-based interactions
- **Animated Reactions** - Beautiful heart animations on like
- **Expandable Descriptions** - Click to expand long video descriptions
- **Mobile-Optimized** - Perfect viewport handling with `dvh` units
- **Centered Play/Pause** - Large, centered controls on all devices
- **Performance Optimized** - Instant scroll to specific videos without triggering intermediate videos

### 🔐 Authentication
- **Popup Modals** - Modern modal-based login/signup (no page navigation)
- **Google OAuth** - One-click sign in with Google
- **Email/Password** - Traditional credentials-based authentication
- **Protected Routes** - Upload and profile pages require authentication
- **Guest Browsing** - Public video feed accessible without login
- **Smart Login Prompts** - Friendly popup prompts for protected actions (like videos)
- **Logout Confirmation** - Consistent confirmation modals across Sidebar and Profile

### 🎨 User Interface
- **Responsive Design** - Optimized for mobile, tablet, and desktop
- **Dark Theme** - Sleek dark mode throughout
- **Glassmorphism** - Modern UI with backdrop blur effects
- **Gradient Accents** - Pink-to-purple brand colors
- **Mobile Keyboard Handling** - Proper viewport adjustments on input focus
- **Consistent Branding** - KLIP logo and gradient text throughout

### 👤 User Features
- **Profile Management** - View your uploaded videos and stats
- **User Profiles** - Click on any username/avatar to view their profile
- **Back Navigation** - Smart back button returns to exact video position
- **Video Upload** - Easy video upload with title and description
- **Like System** - Like videos with instant visual feedback
- **Video Grid** - Beautiful grid layout for user profiles
- **Profile Stats** - View video count and total likes

## 🛠️ Tech Stack

### Core Framework
- **[Next.js 15.5.6](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first styling
- **PWA Support** - Installable app with offline capabilities

### Backend & Database
- **[tRPC](https://trpc.io/)** - End-to-end typesafe APIs
- **[Prisma](https://www.prisma.io/)** - Type-safe database ORM
- **[Supabase](https://supabase.com/)** - PostgreSQL database & storage
- **[NextAuth.js](https://next-auth.js.org/)** - Authentication

### State & Data
- **[TanStack Query](https://tanstack.com/query)** - Data fetching & caching
- **[Zod](https://zod.dev/)** - Schema validation

## 📁 Project Structure

```
src/
├── app/
│   ├── _components/          # Reusable React components
│   │   ├── AuthModalContext.tsx    # Global auth modal state
│   │   ├── AuthModals.tsx          # Modal wrapper component
│   │   ├── LogInModal.tsx          # Login modal
│   │   ├── SignUpModal.tsx         # Signup modal
│   │   ├── Feed.tsx                # Video feed with auto-play
│   │   ├── ProfilePage.tsx         # Profile page component
│   │   ├── UploadForm.tsx          # Video upload form
│   │   ├── Sidebar.tsx             # Desktop navigation
│   │   └── BottomNav.tsx           # Mobile navigation
│   ├── upload/               # Upload page route
│   ├── profile/              # Profile routes
│   │   ├── page.tsx          # Own profile page
│   │   └── [userId]/         # Dynamic user profile
│   │       └── page.tsx      # User profile page
│   ├── layout.tsx            # Root layout with providers
│   └── page.tsx              # Home page (video feed)
├── server/
│   ├── api/
│   │   ├── routers/          # tRPC routers
│   │   │   ├── video.ts      # Video operations
│   │   │   └── auth.ts       # Auth operations
│   │   └── root.ts           # Root router
│   ├── auth/
│   │   └── config.ts         # NextAuth configuration
│   └── db.ts                 # Prisma client
├── lib/
│   └── supabase.ts           # Supabase client
└── styles/
    └── globals.css           # Global styles
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Google OAuth credentials (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd KLIP
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory (see `.env.example` for reference):
   ```env
   # Database
   DATABASE_URL="postgresql://..."
   DIRECT_DATABASE_URL="postgresql://..."

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

   # NextAuth
   AUTH_SECRET="your-secret-key"
   AUTH_GOOGLE_ID="your-google-client-id"
   AUTH_GOOGLE_SECRET="your-google-client-secret"
   ```
   
   > **Note:** Copy `.env.example` to `.env` and fill in your actual values.

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)**

## 🗄️ Database Schema

### Tables
- **User** - User accounts and profiles
- **Video** - Uploaded videos with metadata
- **Like** - Video likes (user-video relationship)
- **Account** - OAuth account connections

### Key Features
- Application-level security via tRPC
- Optimized queries with Prisma
- Supabase Storage for video files

### Mobile-First Approach
- Uses `100dvh` (dynamic viewport height) for proper mobile display
- Prevents scrolling issues caused by mobile browser address bars
- Responsive modals: smaller on mobile, larger on desktop

### Authentication Flow
- Public video feed for guest users
- Modal-based auth (no page navigation)
- Protected actions trigger friendly login prompts
- Seamless user experience with smart popups

### 🎨 Design Decisions & UX Patterns
- **Smart Login Prompts**: Non-intrusive popups for unauthenticated interactions
- **Visual Feedback**: "Tap to Unmute" indicators and "Resume" animations for clear state communication
- **Instant Scroll Navigation**: `scrollIntoView` with `instant` behavior prevents intermediate video playback
- **AbortError Suppression**: Handles rapid scrolling gracefully without console noise
- **Double-tap to like** - Prevents interference with play/pause
- **Instant feedback** - Animations before server confirmation
- **Consistent naming** - "Log In", "Log Out", "Sign Up" throughout
- **Clickable profiles** - Navigate to user profiles from feed
- **Smart back navigation** - Returns to exact video position
- **Expandable content** - Long descriptions expand on click
- **Confirmation modals** - Logout requires confirmation
- **Friendly prompts** - Login prompts with KLIP branding

## 📱 Mobile Features

### Viewport Handling
- Dynamic viewport height (`dvh`) units
- Proper keyboard behavior on input focus
- No manual scrolling required

### Touch Interactions
- Single tap: Play/Pause video
- Double tap: Like video
- Swipe: Scroll to next/previous video

### Responsive Modals
- Mobile: `max-w-sm` (384px) with compact padding
- Desktop: `max-w-md` (448px) with spacious layout
- Adaptive text sizes and spacing

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:push      # Push schema changes to database
npm run db:studio    # Open Prisma Studio
```

### Code Quality
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting (recommended)

## 🌐 Deployment

### Recommended Platforms
- **[Vercel](https://vercel.com/)** - Optimal for Next.js apps
- **[Supabase](https://supabase.com/)** - Database & storage

### Environment Setup
1. Set up Supabase project
2. Configure environment variables
3. Run database migrations
4. Deploy to Vercel

## 📱 PWA (Progressive Web App)

KLIP is a fully installable Progressive Web App! Users can install it on their mobile devices for a native app-like experience.

### Features
- **Installable** - Add to home screen on iOS and Android
- **Offline Support** - Cached assets work without internet
- **App-like Experience** - Full-screen mode without browser UI
- **Fast Loading** - Service worker caching for instant loads

### How to Install

#### On Android (Chrome/Edge):
1. Open KLIP in Chrome
2. Tap the menu (⋮) → "Install app" or "Add to Home screen"
3. Confirm installation
4. App icon appears on home screen

#### On iOS (Safari):
1. Open KLIP in Safari
2. Tap the Share button (□↑)
3. Scroll and tap "Add to Home Screen"
4. Name it "KLIP" and tap "Add"
5. App icon appears on home screen

### Technical Details
- **Manifest**: `/public/manifest.json`
- **Service Worker**: `/public/sw.js`
- **Icons**: 192x192 and 512x512 PNG icons
- **Caching Strategy**: Network-first with cache fallback
- **Theme Color**: Black (#000000)

## 📝 License
This project is built with the [T3 Stack](https://create.t3.gg/).
Licensed under the MIT License - see the [LICENSE](LICENSE) file for details.