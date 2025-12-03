# KLIP - Short-Form Video Platform

A modern short-form video platform built with the T3 Stack (Next.js, tRPC, Tailwind CSS, TypeScript) and Supabase.

## Features

- 🎥 **Video Feed**: Infinite scroll feed with snap scrolling and auto-play
- 📤 **Video Upload**: Drag-and-drop upload with progress tracking
- 🔐 **Authentication**: Google OAuth and Email/Password login/signup
- ❤️ **Interactions**: Like videos and see real-time counts
- 📱 **Responsive Design**: Mobile-first UI with bottom navigation
- 🎨 **Modern UI**: Dark mode, glassmorphism, and smooth animations

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org)
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **API**: [tRPC](https://trpc.io)
- **Database**: [Supabase PostgreSQL](https://supabase.com)
- **ORM**: [Prisma](https://www.prisma.io)
- **Auth**: [NextAuth.js](https://next-auth.js.org)
- **Storage**: [Supabase Storage](https://supabase.com/storage)

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase Account
- Google Cloud Console Account (for OAuth)

### Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Configure your `.env` file with the following variables:

   ```bash
   # Database (Supabase)
   DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:6543/postgres?pgbouncer=true"
   DIRECT_DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"

   # Supabase API
   NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="[ANON-KEY]"

   # NextAuth
   AUTH_SECRET="[GENERATED-SECRET]" # Generate with: npx auth secret
   AUTH_GOOGLE_ID="[GOOGLE-CLIENT-ID]"
   AUTH_GOOGLE_SECRET="[GOOGLE-CLIENT-SECRET]"
   ```

### Database Setup

1. Push the Prisma schema to your Supabase database:
   ```bash
   npx prisma db push
   ```

2. Run the RLS policies SQL script in your Supabase SQL Editor (located at `prisma/rls-policies.sql`).

### Storage Setup

1. Go to your Supabase Dashboard -> Storage
2. Create a new public bucket named `videos`
3. Add a policy to allow public uploads (or disable RLS for storage if prototyping)

### Running the App

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

- `src/app`: Next.js App Router pages and layouts
- `src/server/api`: tRPC routers and procedures
- `src/server/auth`: NextAuth configuration
- `src/server/db`: Prisma client instance
- `prisma`: Database schema and migrations

## License

MIT
