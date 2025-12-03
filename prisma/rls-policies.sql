-- IMPORTANT: Since we're using NextAuth instead of Supabase Auth,
-- we need to disable RLS or use different policies that don't rely on auth.uid()

-- Option 1: Disable RLS (simpler for development with NextAuth)
ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Video" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Like" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Account" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "VerificationToken" DISABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users are viewable by everyone" ON "User";
DROP POLICY IF EXISTS "Users can update own profile" ON "User";
DROP POLICY IF EXISTS "Service role can insert users" ON "User";
DROP POLICY IF EXISTS "Videos are viewable by everyone" ON "Video";
DROP POLICY IF EXISTS "Authenticated users can create videos" ON "Video";
DROP POLICY IF EXISTS "Users can update own videos" ON "Video";
DROP POLICY IF EXISTS "Users can delete own videos" ON "Video";
DROP POLICY IF EXISTS "Likes are viewable by everyone" ON "Like";
DROP POLICY IF EXISTS "Authenticated users can create likes" ON "Like";
DROP POLICY IF EXISTS "Users can delete own likes" ON "Like";
DROP POLICY IF EXISTS "Users can view own accounts" ON "Account";
DROP POLICY IF EXISTS "Service role can manage accounts" ON "Account";
DROP POLICY IF EXISTS "Users can view own sessions" ON "Session";
DROP POLICY IF EXISTS "Service role can manage sessions" ON "Session";
DROP POLICY IF EXISTS "Service role can manage verification tokens" ON "VerificationToken";

-- Note: If you want to use RLS with NextAuth, you would need to:
-- 1. Create a custom function that gets the user ID from NextAuth session
-- 2. Use that function in your policies instead of auth.uid()
-- 3. This requires more complex setup with JWT verification

-- For now, we're disabling RLS since:
-- - We're using NextAuth for authentication (not Supabase Auth)
-- - Application-level security is handled by tRPC protected procedures
-- - This is a prototype/development environment
