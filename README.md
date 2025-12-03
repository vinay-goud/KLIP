# KLIP - Short-Form Video Platform Setup Guide

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works fine)

## Initial Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to finish setting up (takes ~2 minutes)
3. Once ready, go to **Project Settings** → **Database**
   - Copy the **Connection string** (URI format)
   - Replace `[YOUR-PASSWORD]` with your database password
4. Go to **Project Settings** → **API**
   - Copy the **Project URL**
   - Copy the **anon/public** key

### 3. Create Storage Bucket

1. In your Supabase dashboard, go to **Storage**
2. Click **New bucket**
3. Name it `videos`
4. Make it **Public** (or configure RLS policies as needed)
5. Click **Create bucket**

### 4. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and fill in your Supabase credentials:
   ```bash
   # Generate a secret for NextAuth
   AUTH_SECRET="your-random-secret-here"
   
   # Supabase Database URL (from step 2.3)
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres"
   
   # Supabase API credentials (from step 2.4)
   NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
   ```

   To generate `AUTH_SECRET`, run:
   ```bash
   npx auth secret
   ```

### 5. Set Up Database

Push the Prisma schema to your Supabase database:

```bash
npx prisma db push
npx prisma generate
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Sign In

1. Click the **Login** button
2. Enter any username (e.g., "testuser")
3. Click **Sign in**
4. The app will automatically create an account for you

### Upload a Video

1. Make sure you're signed in
2. Click the **+ Upload** button in the header
3. Fill in the form:
   - **Title**: Give your video a catchy title
   - **Description**: (Optional) Add a description
   - **Video File**: Select a video file from your device (MP4, WebM, MOV - max 100MB)
4. Click **Upload Video**
5. Wait for the upload to complete
6. You'll be redirected to the feed where your video will appear

### Browse Videos

- Scroll through the feed to see all videos
- Videos will snap to full screen as you scroll (TikTok-style)
- Click the play button to watch a video
- Click the heart icon to like/unlike a video

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: tRPC, Prisma ORM
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage
- **Authentication**: NextAuth.js with Credentials Provider

## Project Structure

```
src/
├── app/
│   ├── _components/
│   │   ├── Feed.tsx          # Main video feed with infinite scroll
│   │   └── UploadForm.tsx    # Video upload form
│   ├── upload/
│   │   └── page.tsx          # Upload page (protected)
│   └── page.tsx              # Home page (feed)
├── server/
│   ├── api/
│   │   ├── routers/
│   │   │   └── video.ts      # Video tRPC router
│   │   └── root.ts           # Main tRPC router
│   ├── auth/
│   │   └── config.ts         # NextAuth configuration
│   └── db.ts                 # Prisma client
├── lib/
│   └── supabase.ts           # Supabase client
└── styles/
    └── globals.css           # Global styles

prisma/
└── schema.prisma             # Database schema
```

## Database Schema

### User
- `id`: Unique identifier
- `name`: Username
- `email`: Email address
- `videos`: Relation to uploaded videos
- `likes`: Relation to liked videos

### Video
- `id`: Unique identifier
- `title`: Video title
- `description`: Optional description
- `url`: Public URL to video file in Supabase Storage
- `thumbnail`: Optional thumbnail URL
- `userId`: Reference to uploader
- `likes`: Relation to likes

### Like
- `id`: Unique identifier
- `userId`: Reference to user who liked
- `videoId`: Reference to liked video
- Unique constraint on `(userId, videoId)` to prevent duplicate likes

## Troubleshooting

### Database Connection Issues

- Make sure your `DATABASE_URL` is correct
- Check that your Supabase project is active
- Verify your database password is correct

### Upload Fails

- Ensure the `videos` bucket exists in Supabase Storage
- Check that the bucket is set to public
- Verify your `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
- Make sure the video file is under 100MB

### Videos Don't Play

- Check browser console for errors
- Verify the video URL is publicly accessible
- Try a different video format (MP4 is most compatible)

## Future Enhancements

- Video thumbnail generation
- Comments system
- User profiles
- Follow/unfollow functionality
- Video search and filtering
- Analytics dashboard
- Proper authentication (OAuth, email/password)
- Video transcoding for optimal playback
