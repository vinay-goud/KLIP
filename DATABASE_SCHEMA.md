# KLIP Database Schema

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         DATABASE SCHEMA                          │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│       User           │
├──────────────────────┤
│ id (PK)              │ String (cuid)
│ name                 │ String?
│ email (UNIQUE)       │ String
│ emailVerified        │ DateTime?
│ image                │ String?
│ password             │ String? (hashed)
└──────────────────────┘
         │
         │ 1:N
         ├─────────────────────┐
         │                     │
         ▼                     ▼
┌──────────────────────┐  ┌──────────────────────┐
│       Video          │  │        Like          │
├──────────────────────┤  ├──────────────────────┤
│ id (PK)              │  │ id (PK)              │
│ title                │  │ userId (FK)          │───┐
│ description          │  │ videoId (FK)         │───┼──┐
│ url                  │  │ createdAt            │   │  │
│ thumbnail            │  └──────────────────────┘   │  │
│ createdAt            │         │                   │  │
│ updatedAt            │         │ N:1               │  │
│ userId (FK)          │◄────────┘                   │  │
└──────────────────────┘                             │  │
         │                                           │  │
         │ 1:N                                       │  │
         └───────────────────────────────────────────┘  │
                                                        │
         ┌──────────────────────────────────────────────┘
         │
         │ N:1
         ▼
┌──────────────────────┐
│      Account         │
├──────────────────────┤
│ id (PK)              │
│ userId (FK)          │
│ type                 │
│ provider             │
│ providerAccountId    │
│ refresh_token        │
│ access_token         │
│ expires_at           │
│ token_type           │
│ scope                │
│ id_token             │
│ session_state        │
└──────────────────────┘


## Table Details

### User Table
**Purpose:** Stores user account information
**Fields:**
- `id`: Primary key (cuid)
- `name`: User's display name
- `email`: Unique email address
- `emailVerified`: Email verification timestamp
- `image`: Profile picture URL
- `password`: Hashed password (bcrypt)

**Relationships:**
- Has many Videos (1:N)
- Has many Likes (1:N)
- Has many Accounts (1:N) - for OAuth

**Indexes:**
- Primary key on `id`
- Unique index on `email`

---

### Video Table
**Purpose:** Stores uploaded video metadata
**Fields:**
- `id`: Primary key (cuid)
- `title`: Video title
- `description`: Optional description
- `url`: Video file URL (Supabase Storage)
- `thumbnail`: Optional thumbnail URL
- `createdAt`: Upload timestamp
- `updatedAt`: Last update timestamp
- `userId`: Foreign key to User

**Relationships:**
- Belongs to User (N:1)
- Has many Likes (1:N)

**Indexes:**
- Primary key on `id`
- Index on `userId` (for user's videos)
- Index on `createdAt` (for feed ordering)

**Cascade:**
- ON DELETE CASCADE (when user is deleted)

---

### Like Table
**Purpose:** Stores video likes (many-to-many relationship)
**Fields:**
- `id`: Primary key (cuid)
- `userId`: Foreign key to User
- `videoId`: Foreign key to Video
- `createdAt`: Like timestamp

**Relationships:**
- Belongs to User (N:1)
- Belongs to Video (N:1)

**Indexes:**
- Primary key on `id`
- Index on `userId` (for user's likes)
- Index on `videoId` (for video's likes)
- Unique composite index on `(userId, videoId)` (prevent duplicate likes)

**Cascade:**
- ON DELETE CASCADE (when user or video is deleted)

---

### Account Table
**Purpose:** Stores OAuth provider accounts (NextAuth.js)
**Fields:**
- `id`: Primary key (cuid)
- `userId`: Foreign key to User
- `type`: Account type (oauth, email, etc.)
- `provider`: Provider name (google, etc.)
- `providerAccountId`: Provider's user ID
- `refresh_token`: OAuth refresh token
- `access_token`: OAuth access token
- `expires_at`: Token expiration
- `token_type`: Token type
- `scope`: OAuth scopes
- `id_token`: ID token
- `session_state`: Session state

**Relationships:**
- Belongs to User (N:1)

**Indexes:**
- Primary key on `id`
- Unique composite index on `(provider, providerAccountId)`

**Cascade:**
- ON DELETE CASCADE (when user is deleted)

---

## Key Design Decisions

### 1. Cascade Deletes
All foreign keys use `onDelete: Cascade` to maintain referential integrity:
- Deleting a user removes all their videos, likes, and accounts
- Deleting a video removes all its likes

### 2. Unique Constraints
- `User.email`: Prevents duplicate accounts
- `Like(userId, videoId)`: Prevents duplicate likes
- `Account(provider, providerAccountId)`: Prevents duplicate OAuth accounts

### 3. Indexes
Strategic indexes for common queries:
- `Video.userId`: Fast lookup of user's videos
- `Video.createdAt`: Fast feed ordering (newest first)
- `Like.userId`: Fast lookup of user's likes
- `Like.videoId`: Fast lookup of video's like count

### 4. Optional Fields
- `User.name`, `User.image`: Allow OAuth users without these fields
- `User.password`: Allow OAuth-only users
- `Video.description`, `Video.thumbnail`: Optional metadata

### 5. Timestamps
- `Video.createdAt`, `Video.updatedAt`: Track video lifecycle
- `Like.createdAt`: Track when likes occurred
- `User.emailVerified`: Track email verification

---

## Query Patterns

### Common Queries Supported:

1. **Get Feed Videos** (with pagination)
   ```sql
   SELECT * FROM Video 
   ORDER BY createdAt DESC 
   LIMIT 10
   ```
   - Uses index on `createdAt`

2. **Get User's Videos**
   ```sql
   SELECT * FROM Video 
   WHERE userId = ?
   ```
   - Uses index on `userId`

3. **Get Video Like Count**
   ```sql
   SELECT COUNT(*) FROM Like 
   WHERE videoId = ?
   ```
   - Uses index on `videoId`

4. **Check if User Liked Video**
   ```sql
   SELECT * FROM Like 
   WHERE userId = ? AND videoId = ?
   ```
   - Uses unique composite index

5. **Get User's Liked Videos**
   ```sql
   SELECT Video.* FROM Video 
   JOIN Like ON Video.id = Like.videoId 
   WHERE Like.userId = ?
   ```
   - Uses index on `Like.userId`

---

## Performance Optimizations

1. **Indexes on Foreign Keys**: All foreign keys have indexes
2. **Composite Unique Index**: Prevents duplicate likes efficiently
3. **Timestamp Indexes**: Fast sorting by creation date
4. **Cascade Deletes**: Database-level cleanup (no orphaned records)
5. **Prisma Query Optimization**: Includes only necessary relations

---

## Security Considerations

1. **Password Hashing**: bcrypt with salt rounds = 10
2. **Email Uniqueness**: Prevents account enumeration
3. **Cascade Deletes**: Automatic cleanup of user data
4. **Type Safety**: Prisma ensures type-safe queries
5. **Input Validation**: Zod schemas validate all inputs
