# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 14 application for managing multiple metronomes to track practice progress for musicians. Each metronome maintains its own BPM, timer, and usage statistics. The app uses:
- **Framework**: Next.js 14 (App Router) with TypeScript and React 18
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS with DaisyUI
- **Auth**: JWT-based authentication (jose library) with HTTP-only cookies
- **Email**: Resend.com for password reset emails
- **Deployment**: Vercel (primary), with optional Azure/Docker support

## Common Development Commands

### Development
```bash
npm run dev                    # Start Next.js dev server on http://localhost:3000
npm run dev:db:start          # Start local PostgreSQL in Docker + run migrations
npm run dev:db:stop           # Stop local PostgreSQL container
```

### Database (Prisma)
```bash
npm run db:migrate            # Create and apply new migration (dev)
npx prisma migrate deploy     # Apply migrations (production)
npm run db:seed               # Seed database with test data
npm run db:reset              # Reset database to initial state (deletes all data)
npx prisma generate           # Generate Prisma client (runs automatically after npm install)
npx prisma studio             # Open Prisma Studio GUI
```

### Testing
```bash
npm test                      # Run all Jest tests
npm test -- -t "test name"    # Run specific test by name
npm test -- path/to/test.ts   # Run specific test file
```

For debugging tests in VSCode:
1. Add `debugger` statement in test
2. Run: `node --inspect-brk ./node_modules/jest/bin/jest.js --runInBand -t "test name"`
3. Use "Attach debugger to Jest" launch configuration

### Build & Production
```bash
npm run build                 # Build Next.js app for production
npm start                     # Run production build (uses standalone output)
npm run docker:up:build       # Build and run full stack (app + DB) in Docker
npm run docker:down           # Stop Docker containers
```

### Linting
```bash
npm run lint                  # Run Next.js ESLint
```

## Architecture & Key Patterns

### Database Layer (`db/`)
- **db/db.ts**: Singleton Prisma client with dev/prod environment handling
- **db/metronome.ts**: All metronome CRUD operations (list, create, update, delete, get)
- Uses Prisma transactions for count+list operations to ensure consistency

### Authentication Flow
1. JWT tokens stored in HTTP-only cookies (expires in 2 days)
2. **middleware.ts**: Handles all route protection and token refresh
   - Protected routes redirect to `/login?target={path}` without valid token
   - Auth pages (login/register/reset-password) redirect to `/metronome/recent` with valid token
   - Landing pages (`/`, `/metronome/`) route to `/metronome/new` (logged out) or `/metronome/recent` (logged in)
   - API routes return 401 without valid token
   - Refreshes token expiry on every request
3. **lib/jwt.ts**: Token creation, verification, and decoding

### API Routes (Next.js Route Handlers)
- **app/api/metronomes/route.ts**: GET endpoint for listing metronomes
- **app/api/health/route.ts**: Health check endpoint
- **app/api/debug/route.ts**: Debug endpoint
- Use Next.js Route Handlers (GET, POST, etc. exports)
- Extract userId from JWT token in request cookies or `x-access-token` header

### Component Architecture

#### Metronome Component (`components/metronome/`)
The metronome is split into stored state (persisted to DB) and local state (UI-only):
- **StoredMetronome**: Database fields (id, name, bpm, beats, timerValue, timeUsed, locked, etc.)
- **LocalMetronomeSettings**: UI state (isPlaying, currentUsed, sessionUsed, activeTimer)
- **MetronomeFull**: Combined type used by main component

**State Management**:
- **hooks/useMetronomeReducer.ts**: Reducer managing all metronome state
- **hooks/useMetronomeState.ts**: Main hook wrapping reducer with business logic
- **hooks/useAutoSave.ts**: Debounced auto-save to server
- **app/hooks/useMetronomeActions.ts**: Server actions (save, delete)

**UI Components** (`components/metronome/ui/`):
- BeatArea, BpmButton, BpmSlider, PlayPauseButton, TapButton
- TimerArea, StatsArea, LockUnlockButton, TitleInput, UseTimerCheckbox

#### Shared Hooks (`app/hooks/`)
- **useMetronomeActions.ts**: CRUD operations with server communication
- **useAsyncAction.ts**: Generic async action handler with loading/error states
- **useToast.ts**: Toast notification hook (uses ToastContext)
- **useCurrentPath.ts**: Current pathname helper
- **useCommandHandler.ts**: Keyboard command handling

### Routing Structure
- `/` or `/metronome/` - Landing page (redirects based on auth)
- `/metronome/new` - Create new metronome (unauthenticated users)
- `/metronome/recent` - Most recently used metronome (authenticated users)
- `/metronome/[id]` - Specific metronome page
- `/list` - List all metronomes
- `/login`, `/register`, `/logout` - Auth pages
- `/reset-password`, `/reset-password/confirm` - Password reset flow
- `/account/*` - User account management (edit username, email, password, delete account)

### Database Schema (Prisma)
**User**: id, email (unique, optional), name (unique), password (bcrypt hashed), timestamps
**Metronome**: id, name, bpm, beats, stressFirst, lastOpened, timerValue, timerActive, timeUsed, showStats, locked, owner (FK to User), timestamps

### Environment Variables
See `env.local.template` for required variables:
- `POSTGRES_PRISMA_URL`: PostgreSQL connection string
- `TOKEN_KEY`: JWT signing secret
- `RESEND_API_KEY`: Resend.com API key for password reset emails
- Docker-specific: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`

### Path Aliases
Uses `@/*` to reference root directory (configured in tsconfig.json):
```typescript
import { getDb } from '@/db/db'
import { METRONOME_CONSTANTS } from '@/constants/metronome'
```

### Testing
- Jest with ts-jest preset for TypeScript
- React Testing Library for component tests
- jsdom environment for DOM testing
- Setup file: `jest.setup.ts`

## Development Tips

### Adding a New API Route
1. Create route handler in `app/api/{route}/route.ts`
2. Export HTTP method functions (GET, POST, etc.)
3. Extract userId from JWT: `await getUserAttrFromToken(request.cookies.get('token')?.value)`
4. Return `NextResponse.json()` responses
5. Add route to middleware matcher if authentication is required

### Adding Protected Routes
1. Add path pattern to `middleware.ts` config.matcher array
2. Determine if route requires authentication
3. Update middleware logic if custom redirect behavior is needed

### Working with Prisma
1. Modify `prisma/schema.prisma`
2. Create migration: `npm run db:migrate` (creates migration file and applies it)
3. Prisma client regenerates automatically
4. For production: use `npx prisma migrate deploy` (doesn't create migration files)

### Password Reset Flow
1. User submits email at `/reset-password`
2. Backend generates JWT token with 10-minute expiry
3. Email sent via Resend with reset link containing token
4. User clicks link to `/reset-password/confirm?token={jwt}`
5. User submits new password, validated against token

## Build Configuration

- **next.config.js**: Configured with `output: 'standalone'` for containerized deployments
- **Docker**: Multi-stage build in Dockerfile, uses standalone output
- **Vercel**: Automatic deployments (dev branch = preview, master = production)
