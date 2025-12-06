# KLIP Architecture

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         KLIP ARCHITECTURE                            │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   Browser    │  │   Mobile     │  │     PWA      │              │
│  │   (Desktop)  │  │   (Safari)   │  │  (Installed) │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│         │                  │                  │                      │
│         └──────────────────┴──────────────────┘                      │
│                            │                                         │
│                            ▼                                         │
│                  ┌──────────────────┐                               │
│                  │  Service Worker  │                               │
│                  │  (Offline Cache) │                               │
│                  └──────────────────┘                               │
└─────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      NEXT.JS APP ROUTER                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                    React Components                         │    │
│  ├────────────────────────────────────────────────────────────┤    │
│  │  Feed  │  Upload  │  Profile  │  Auth Modals  │  Navigation│    │
│  └────────────────────────────────────────────────────────────┘    │
│                            │                                         │
│                            ▼                                         │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                  TanStack Query (React Query)               │    │
│  │              (Caching, Optimistic Updates)                  │    │
│  └────────────────────────────────────────────────────────────┘    │
│                            │                                         │
│                            ▼                                         │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                    tRPC Client                              │    │
│  │              (Type-safe API Calls)                          │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         API LAYER (tRPC)                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────────┐  ┌────────────────┐                            │
│  │  Auth Router   │  │  Video Router  │                            │
│  ├────────────────┤  ├────────────────┤                            │
│  │  - signup      │  │  - create      │                            │
│  │                │  │  - getInfinite │                            │
│  │                │  │  - toggleLike  │                            │
│  └────────────────┘  └────────────────┘                            │
│         │                     │                                      │
│         └─────────────────────┘                                      │
│                    │                                                 │
│                    ▼                                                 │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │              Middleware & Context                           │    │
│  │  - Session Management (NextAuth.js)                         │    │
│  │  - Protected Procedures                                     │    │
│  │  - Input Validation (Zod)                                   │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      DATA ACCESS LAYER                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                    Prisma ORM                               │    │
│  │              (Type-safe Database Queries)                   │    │
│  └────────────────────────────────────────────────────────────┘    │
│                            │                                         │
│         ┌──────────────────┴──────────────────┐                    │
│         ▼                                      ▼                     │
│  ┌──────────────┐                    ┌──────────────┐              │
│  │  PostgreSQL  │                    │   Supabase   │              │
│  │  (Supabase)  │                    │   Storage    │              │
│  ├──────────────┤                    ├──────────────┤              │
│  │ - User       │                    │ - Videos     │              │
│  │ - Video      │                    │ - Thumbnails │              │
│  │ - Like       │                    │              │              │
│  │ - Account    │                    │              │              │
│  └──────────────┘                    └──────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────────┐  ┌────────────────┐                            │
│  │  Google OAuth  │  │   Email SMTP   │                            │
│  │  (Sign In)     │  │  (Future)      │                            │
│  └────────────────┘  └────────────────┘                            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

```
src/
├── app/                          # Next.js App Router
│   ├── _components/              # Shared React Components
│   │   ├── Feed.tsx              # Video feed with infinite scroll
│   │   ├── ProfilePage.tsx       # User profile display
│   │   ├── UploadForm.tsx        # Video upload form
│   │   ├── AuthModals.tsx        # Authentication modals
│   │   ├── LogInModal.tsx        # Login modal
│   │   ├── SignUpModal.tsx       # Signup modal
│   │   ├── Sidebar.tsx           # Desktop navigation
│   │   ├── BottomNav.tsx         # Mobile navigation
│   │   ├── AuthModalContext.tsx  # Auth modal state
│   │   └── PWARegister.tsx       # Service worker registration
│   │
│   ├── profile/                  # Profile routes
│   │   ├── page.tsx              # Own profile
│   │   └── [userId]/page.tsx     # Dynamic user profile
│   │
│   ├── upload/                   # Upload route
│   │   ├── page.tsx              # Upload page (server)
│   │   └── UploadPageClient.tsx  # Upload client component
│   │
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page (feed)
│
├── server/                       # Backend code
│   ├── api/
│   │   ├── routers/
│   │   │   ├── auth.ts           # Auth API endpoints
│   │   │   └── video.ts          # Video API endpoints
│   │   ├── root.ts               # tRPC root router
│   │   └── trpc.ts               # tRPC setup
│   │
│   ├── auth/
│   │   └── config.ts             # NextAuth configuration
│   │
│   └── db.ts                     # Prisma client
│
├── lib/
│   └── supabase.ts               # Supabase client
│
└── styles/
    └── globals.css               # Global styles
```

---

## Data Flow

### 1. Video Upload Flow
```
User → Upload Form → tRPC (create) → Supabase Storage → Database → Profile
  │         │              │               │                │          │
  │         │              │               │                │          │
  ▼         ▼              ▼               ▼                ▼          ▼
Select   Validate      Protected      Upload File      Save URL    Redirect
Video    Inputs        Procedure      (get URL)        to DB       & Display
```

### 2. Feed Display Flow
```
User → Feed Component → tRPC (getInfinite) → Database → Transform → Display
  │          │                  │                 │          │          │
  │          │                  │                 │          │          │
  ▼          ▼                  ▼                 ▼          ▼          ▼
Scroll   Auto-Load More    Public Query      Get Videos   Add Like   Smart Play
Down     (Observer)        (with likes)      + Users      Status     (Mute/Unmute)
```
**Note:** 
- Uses IntersectionObserver for automatic infinite scroll.
- Implements "Smart Autoplay": Videos start muted to comply with browser policies.
- **Seamless Audio**: Any interaction (tap, scroll) unmutes the global state.
- **Fallback Handling**: Automatically falls back to muted playback if unmuted autoplay is blocked.

### 3. Authentication Flow
```
User → Auth Modal → tRPC (signup) → Hash Password → Database → Session
  │         │             │               │             │          │
  │         │             │               │             │          │
  ▼         ▼             ▼               ▼             ▼          ▼
Click    Enter        Validate        bcrypt         Create     NextAuth
Sign Up  Details      Inputs          (10 rounds)    User       Cookie
```

### 4. Like Flow
```
User → Double Tap → tRPC (toggleLike) → Database → Optimistic Update → UI
  │         │              │                 │              │            │
  │         │              │                 │              │            │
  ▼         ▼              ▼                 ▼              ▼            ▼
Watch   Detect        Protected         Check if      Update Cache   Show
Video   Gesture       Procedure         Exists        Immediately    Animation
```

---

## Technology Stack Details

### Frontend
- **Next.js 15.5.6**: React framework with App Router
- **React 19**: UI library
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first styling
- **TanStack Query**: Data fetching & caching
- **Lucide React**: Icons

### Backend
- **tRPC**: Type-safe API
- **NextAuth.js**: Authentication
- **Prisma**: ORM
- **Zod**: Schema validation
- **bcryptjs**: Password hashing

### Database & Storage
- **PostgreSQL**: Relational database (Supabase)
- **Supabase Storage**: Video file storage

### DevOps
- **Git**: Version control
- **Turbopack**: Fast bundler (Next.js)
- **ESLint**: Code linting

---

## Key Design Patterns

### 1. Server Components + Client Components
- Server components for data fetching
- Client components for interactivity
- Optimal performance

### 2. Type Safety End-to-End
```typescript
// Frontend knows exact API shape
const { data } = api.video.getInfinite.useInfiniteQuery({ limit: 10 });
//     ^? Fully typed response
```

### 3. Optimistic Updates
```typescript
// UI updates before server confirms
toggleLike.mutate({ videoId }, {
  onMutate: () => updateCacheOptimistically()
});
```

### 4. Protected Procedures
```typescript
// Automatic auth check
protectedProcedure.mutation(({ ctx }) => {
  // ctx.session.user is guaranteed to exist
});
```

### 5. Automatic Infinite Scroll
```typescript
// Cursor-based pagination with IntersectionObserver
const { fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
  getNextPageParam: (lastPage) => lastPage.nextCursor
});

// Auto-load when scrolling near bottom
useEffect(() => {
  const observer = new IntersectionObserver((entries) => {
    if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage(); // Automatically load more
    }
  });
  // ... observe trigger element
}, [hasNextPage, isFetchingNextPage, fetchNextPage]);
```

---

## Security Measures

1. **Password Hashing**: bcrypt with 10 salt rounds
2. **Protected Routes**: Server-side session checks
3. **Input Validation**: Zod schemas on all inputs
4. **SQL Injection Prevention**: Prisma parameterized queries
5. **XSS Prevention**: React automatic escaping
6. **CSRF Protection**: NextAuth.js built-in
7. **Type Safety**: TypeScript prevents many bugs

---

## Performance Optimizations

1. **Automatic Infinite Scroll**: Load videos on demand using IntersectionObserver
2. **Optimistic Updates**: Instant UI feedback
3. **React Query Caching**: Reduce API calls
4. **Database Indexes**: Fast queries
5. **Service Worker**: Offline asset caching
6. **Image Optimization**: Next.js automatic
7. **Code Splitting**: Automatic with Next.js

---

## Scalability Considerations

1. **Cursor-based Pagination**: Efficient for large datasets
2. **Database Indexes**: O(log n) lookups
3. **CDN for Videos**: Supabase global CDN
4. **Stateless API**: Easy horizontal scaling
5. **Connection Pooling**: Prisma built-in
6. **Caching Strategy**: React Query + Service Worker
