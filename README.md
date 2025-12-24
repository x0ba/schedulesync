# ScheduleSync

Convert course schedule screenshots into calendar files. Upload a screenshot and export to Google Calendar or generate an iCal file for everything else.

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Clerk
- **AI**: Google Gemini via OpenRouter
- **Styling**: Tailwind CSS
- **Analytics**: PostHog, Sentry

## Setup

1. **Clone and install dependencies**

   ```bash
   git clone <repo-url>
   cd schedulesync
   bun install
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env
   ```

   Fill in the required values:
   - `DATABASE_URL` – PostgreSQL connection string
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` – Clerk auth keys
   - `GOOGLE_GENERATIVE_AI_API_KEY` – For AI-powered schedule parsing
   - `NEXT_PUBLIC_POSTHOG_KEY` – Analytics (optional)
   - `SENTRY_AUTH_TOKEN` – Error tracking (optional)

3. **Start the database** (optional local setup)

   ```bash
   ./start-database.sh
   ```

4. **Run database migrations**

   ```bash
   bun run db:push
   ```

5. **Start the dev server**

   ```bash
   bun run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Development

| Command                | Description                     |
| ---------------------- | ------------------------------- |
| `bun run dev`          | Start dev server with Turbopack |
| `bun run build`        | Production build                |
| `bun run lint`         | Run ESLint                      |
| `bun run typecheck`    | Type check with TypeScript      |
| `bun run format:check` | Check code formatting           |
| `bun run format:write` | Auto-format code                |
| `bun run db:studio`    | Open Drizzle Studio             |
| `bun run db:generate`  | Generate migration files        |
| `bun run db:migrate`   | Run migrations                  |

## Project Structure

```
src/
├── app/                  # Next.js App Router pages and layouts
├── components/           # React components (UI, upload zone, FAQ)
├── server/
│   ├── api/              # tRPC routers
│   ├── db/               # Drizzle schema and database client
│   └── services/         # Business logic (AI parsing, calendar gen)
├── trpc/                 # tRPC client and server setup
├── lib/                  # Shared utilities
├── styles/               # Global CSS
├── middleware.ts         # Clerk auth middleware
└── env.js                # Environment variable validation
```
