# Architecture Overview

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui |
| State | Zustand (global) + TanStack Query (server) |
| Maps | Mapbox GL JS with clustering |
| Backend | Supabase (Postgres + Auth + Realtime + Edge Functions) |
| Animations | Framer Motion |

## Directory Structure

```
src/
├── components/       # UI components (Navbar, TripCard, MapboxMap, etc.)
│   └── ui/           # shadcn/ui primitives
├── contexts/         # React context providers (Auth)
├── hooks/            # Custom hooks (useTrips, useWallet, useRideRequests)
├── lib/              # Utilities & data helpers
│   ├── compatibility.ts   # Cosine-similarity matching
│   ├── campusMap.ts       # Map coordinate helpers
│   └── destinations.ts    # Location constants
├── ml/               # ML compatibility model (feature building, training)
├── pages/            # Route-level page components
├── store/            # Zustand store
├── integrations/     # Auto-generated Supabase client & types
└── types.ts          # Shared TypeScript interfaces

supabase/
├── functions/        # Edge Functions (payments, admin)
└── migrations/       # SQL migrations (schema + RLS)
```

## Data Flow

```
User Action → React Component → Hook (TanStack Query / Supabase SDK)
  → Supabase Postgres (with RLS) → Realtime subscription → UI update
```

## Key Patterns

- **Row-Level Security (RLS)**: Every table has restrictive policies. Users can only access their own data unless explicitly public.
- **Ride Lifecycle**: Trips follow a state machine: `upcoming → active → departed → expired | completed`
- **Compatibility Scoring**: Uses cosine similarity across shared interests, clubs, music preferences, and personality traits.
- **Real-time Updates**: Chat messages and trip status changes propagate instantly via Supabase Realtime.
- **Auto-Expiration**: A database cron job runs every 2 minutes to expire stale trips.
