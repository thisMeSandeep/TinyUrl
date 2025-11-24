# 🔗 TinyLink - URL Shortener

A production-ready URL shortener web application  built with Next.js, PostgreSQL, and Redis. Create, manage, and track short links with a clean, modern interface.

**Live Demo:** [https://tiny-url-theta.vercel.app/](https://tiny-url-theta.vercel.app/)

---

## ✨ Features

- **Create Short Links** - Generate short URLs with optional custom codes (6-8 alphanumeric characters)
- **Smart Redirects** - HTTP 302 redirects with automatic click tracking
- **Dashboard** - View all links in a sortable, searchable table
- **Link Statistics** - Track total clicks and last clicked timestamps
- **Search & Filter** - Quickly find links by code or URL
- **Sorting** - Sort by creation date (newest first) or click count
- **Delete Links** - Remove links with a single click
- **Health Check** - Built-in health check endpoint for monitoring
- **Redis Caching** - Optimized performance with Redis caching
- **Responsive Design** - Works seamlessly on desktop and mobile

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL (Neon recommended)
- **ORM:** Prisma
- **Caching:** Redis (Upstash)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Form Validation:** Zod + React Hook Form
- **State Management:** TanStack Query (React Query)
- **Deployment:** Vercel

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ and **pnpm** (or npm/yarn)
- **PostgreSQL** database (local or cloud like Neon)
- **Redis** instance (Upstash recommended)
- **Git**

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd tinyUrl
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Variables

Create a `.env` file in the root directory and add the following variables:

```env
# Database Configuration
# PostgreSQL connection string (e.g., Neon, Supabase, or local Postgres)
DATABASE_URL="postgresql://user:password@localhost:5432/tinyurl?schema=public"

# Application Configuration
# Base URL of your application (used for generating short link URLs)
# For local development: http://localhost:3000
# For production: https://your-domain.com
BASE_URL="http://localhost:3000"

# Redis Configuration (Upstash)
# Redis REST API URL from Upstash dashboard
UPSTASH_REDIS_REST_URL="https://your-redis-instance.upstash.io"

# Redis REST API Token from Upstash dashboard
UPSTASH_REDIS_REST_TOKEN="your-redis-token-here"
```

### 4. Database Setup

Run Prisma migrations to set up the database schema:

```bash
# Generate Prisma Client
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev
```

### 5. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

---

## 📁 Project Structure

```
tinyUrl/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   └── links/         # Link CRUD endpoints
│   ├── [code]/            # Redirect route
│   ├── code/[code]/       # Stats page
│   ├── healthz/           # Health check
│   └── page.tsx           # Dashboard
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── CreateLinkForm.tsx
│   ├── LinkTable.tsx
│   └── SearchBar.tsx
├── hooks/                 # Custom React hooks
│   └── useLinks.ts       # TanStack Query hooks
├── lib/                   # Utility functions
│   ├── api-helpers.ts    # API utilities
│   ├── formatters.ts     # Formatting functions
│   ├── prisma.ts         # Prisma client
│   ├── redis.ts          # Redis client
│   ├── validations.ts    # Zod schemas
│   └── utils.ts          # General utilities
├── prisma/               # Prisma schema and migrations
│   └── schema.prisma
└── public/               # Static assets
```

---

## 🔌 API Endpoints

### `POST /api/links`
Create a new short link.

**Request Body:**
```json
{
  "longUrl": "https://example.com/very/long/url",
  "shortCode": "abc123" // optional
}
```

**Response (201):**
```json
{
  "shortCode": "abc123",
  "longUrl": "https://example.com/very/long/url",
  "shortUrl": "https://your-site.com/abc123",
  "totalClicks": 0,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Errors:**
- `400` - Validation error
- `409` - Shortcode already exists

---

### `GET /api/links`
Get all links with optional search and sorting.

**Query Parameters:**
- `search` (optional) - Search by shortcode or URL
- `sortBy` (optional) - `"createdAt"` or `"totalClicks"`
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 100)

**Response (200):**
```json
{
  "links": [...],
  "total": 10,
  "page": 1,
  "limit": 100,
  "totalPages": 1
}
```

---

### `GET /api/links/[code]`
Get statistics for a specific link.

**Response (200):**
```json
{
  "shortCode": "abc123",
  "longUrl": "https://example.com/very/long/url",
  "shortUrl": "https://your-site.com/abc123",
  "totalClicks": 42,
  "lastClickedAt": "2024-01-01T12:00:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Errors:**
- `404` - Link not found

---

### `DELETE /api/links/[code]`
Delete a link.

**Response (200):**
```json
{
  "message": "Link deleted successfully"
}
```

**Errors:**
- `404` - Link not found

---

### `GET /healthz`
Health check endpoint.

**Response (200):**
```json
{
  "ok": true,
  "version": "1.0"
}
```

---

## 🎯 Routes

| Route | Purpose | Auth |
|-------|---------|------|
| `/` | Dashboard (list, add, delete links) | Public |
| `/code/:code` | Stats page for a specific code | Public |
| `/:code` | Redirect to long URL (302) | Public |
| `/healthz` | Health check | Public |

---

## 🗄️ Database Schema

```prisma
model Link {
  shortCode     String   @id @db.VarChar(8)
  longUrl       String   @db.Text
  totalClicks   Int      @default(0)
  lastClickedAt DateTime? @db.Timestamptz(3)
  createdAt     DateTime @default(now()) @db.Timestamptz(3)
  updatedAt     DateTime @updatedAt @db.Timestamptz(3)

  @@index([shortCode])
  @@index([createdAt])
  @@index([lastClickedAt])
}
```

---

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `BASE_URL` (your Vercel URL)
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
4. Deploy!

Vercel will automatically:
- Run `pnpm build`
- Deploy your application
- Set up environment variables

### Environment Variables for Production

Make sure to set these in your hosting platform:

```env
DATABASE_URL=your-production-database-url
BASE_URL=https://your-domain.com
UPSTASH_REDIS_REST_URL=your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

---

## 🧪 Development

### Available Scripts

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint

# Prisma commands
pnpm prisma generate    # Generate Prisma Client
pnpm prisma migrate dev # Run migrations
pnpm prisma studio     # Open Prisma Studio
```

---

## 📝 Shortcode Rules

- Must be 6-8 alphanumeric characters
- Regex: `[A-Za-z0-9]{6,8}`
- Must be globally unique
- If not provided, auto-generated

---

## 🎨 Features in Detail

### Dashboard
- View all links in a sortable table
- Search by shortcode or URL
- Sort by creation date or click count
- Delete links with confirmation
- Copy short URLs to clipboard
- View detailed stats for each link

### Link Creation
- URL validation
- Optional custom shortcode
- Auto-generation if code not provided
- Real-time error handling
- Success notifications

### Redirect System
- HTTP 302 redirects
- Automatic click counting
- Last clicked timestamp tracking
- Redis caching for performance

---



## 👨‍💻 Author

Built with ❤️ using Next.js, Prisma, and Redis.

---

## 🔗 Links

- **Live Demo:** [https://tiny-url-theta.vercel.app/](https://tiny-url-theta.vercel.app/)






---

**Happy Linking! 🔗**

