# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ScheduleSync is a web app that converts course schedule screenshots into calendar files (iCal) or syncs them directly to Google Calendar using AI-powered image analysis.

## Commands

```bash
# Development
bun run dev              # Start dev server with Turbopack
bun run build            # Production build
bun run start            # Start production server

# Code quality
bun run check            # Run lint + typecheck
bun run lint:fix         # Fix ESLint issues
bun run format:write     # Format with Prettier

# Database (Drizzle ORM with PostgreSQL)
bun run db:push          # Push schema changes to database
bun run db:studio        # Open Drizzle Studio UI
bun run db:generate      # Generate migrations
bun run db:migrate       # Run migrations
```

## Architecture

**Stack:** Next.js 15 App Router, tRPC 11, Clerk auth, Drizzle ORM, PostgreSQL, Upstash Redis

### API Layer (tRPC)

All API logic lives in `/src/server/api/`. The main router is in `root.ts`, with individual routers in `routers/`.

Procedure types:

- `publicProcedure` - Unauthenticated access
- `protectedProcedure` - Requires Clerk authentication
- `rateLimitedPublicProcedure` / `rateLimitedProtectedProcedure` - With Upstash rate limiting

The schedule router (`routers/schedule.ts`) has three main mutations:

1. `analyzeSchedule` - AI analysis of uploaded images via OpenRouter/Gemini
2. `generateIcal` - Creates iCal file from parsed schedule
3. `syncToGoogleCalendar` - Creates Google Calendar with events

### Services

- `/src/server/services/schedule-analyzer.ts` - Image → structured schedule parsing
- `/src/server/services/google-calendar.ts` - Google Calendar API integration
- `/src/server/services/rate-limiter.ts` - Sliding window rate limiting with Upstash

### Client

- `/src/components/upload-zone.tsx` - Main UI component handling drag-drop upload, event editing, and calendar sync
- `/src/lib/ical.ts` - iCal file generation using ical-generator
- `/src/trpc/react.tsx` - tRPC React client setup

### Key Patterns

- Path alias `@/*` maps to `./src/*`
- Environment validation via Zod in `/src/env.js` (required for build)
- Schedule data is ephemeral (not persisted to database)
- OAuth state persisted to sessionStorage to survive redirects
- superjson transformer for tRPC serialization of complex types
