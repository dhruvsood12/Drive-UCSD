# 🔱 Drive UCSD

**Campus ridesharing built for UCSD students — find compatible rides, split costs, and travel together.**

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)](https://typescriptlang.org)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev)
[![CI](https://github.com/YOUR_USERNAME/drive-ucsd/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/drive-ucsd/actions) 

<!--
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen.svg)](https://drive-ucsd.vercel.app)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/drive-ucsd&env=VITE_SUPABASE_URL,VITE_SUPABASE_PUBLISHABLE_KEY,VITE_SUPABASE_PROJECT_ID,VITE_MAPBOX_ACCESS_TOKEN)
-->

---

## 🎮 Demo (No Account Needed)

The fastest way to explore Drive UCSD:

1. run locally — see [Quick Start](#-quick-start)
2. Click **"Continue as Demo User"** on the login screen
3. Browse the feed, map, and matching — all populated with sample data

Or append `?demo=1` to any URL:
```
https://YOUR_APP_URL/?demo=1
```

> Demo mode is read-only. Destructive actions (payments, posting trips) show a toast explaining the limitation.

---

## 📸 Screenshots

<!-- Add screenshots to public/screenshots/ and uncomment: -->
<!--
| Feed | Map | Matching |
|------|-----|----------|
| ![Feed](public/screenshots/feed.png) | ![Map](public/screenshots/map.png) | ![Matching](public/screenshots/matching.png) |
-->

---

## ✨ Features

- **Smart Matching** — Compatibility scores via cosine similarity on interests, clubs, music, and personality
- **Interactive Map** — Mapbox with clustered ride pins, direction filters, and heatmap demand overlay
- **Ride Lifecycle** — State machine: `upcoming → active → departed → completed / expired`
- **Group Chat** — Real-time in-trip chat with system messages and quick actions
- **Departure Coordination** — Flexible departure windows with rider confirmation
- **Wallet & Payments** — In-app balance system for ride compensation
- **Safety** — Reporting, blocking, admin moderation, and account suspension
- **Demo Mode** — One-click exploration with no signup required

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui, Framer Motion |
| State | Zustand + TanStack Query |
| Maps | Mapbox GL JS (clustering, geocoding) |
| Backend | Supabase (Postgres, Auth, Realtime, Edge Functions) |
| ML | Custom cosine-similarity compatibility model |

## 🚀 Quick Start

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/drive-ucsd.git
cd drive-ucsd

# 2. Install
npm install

# 3. Configure environment
cp .env.example .env
# Fill in your keys (see Environment Variables below)

# 4. Run
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) and click **"Continue as Demo User"**.

### Optional: Seed Database

If you have a Supabase project connected, populate it with sample trips:

```bash
# Copy supabase/seed.sql into your Supabase SQL Editor and run it
# Or use the Supabase CLI:
supabase db reset  # applies migrations + seed
```

> The app ships with 20 built-in mock trips that render automatically when the database is empty, so seeding is optional.

## 🔑 Environment Variables

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `VITE_SUPABASE_URL` | Supabase project URL | [Supabase Dashboard](https://supabase.com/dashboard) → Settings → API |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key | Same as above |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ID | Same as above |
| `VITE_MAPBOX_ACCESS_TOKEN` | Mapbox public token | [Mapbox Account](https://account.mapbox.com/access-tokens/) |

## 🧠 How Matching Works

1. Each profile is encoded into a feature vector (interests, clubs, music, personality)
2. Rider vs driver vectors compared using **cosine similarity**
3. Bonus points for shared college, overlapping clubs, compatible vibes
4. Final score (0–100%) shown on each trip card with breakdown

See [docs/architecture.md](docs/architecture.md) for details.

## 🗄 Database

13 tables with Row-Level Security on every table. Key entities:

| Table | Purpose |
|-------|---------|
| `profiles` | User identity + preferences |
| `trips` | Posted rides with lifecycle status |
| `ride_requests` | Rider applications |
| `chat_messages` | Real-time group chat |
| `wallets` | In-app balance |

Full schema: [docs/schema.md](docs/schema.md)

## 📁 Project Structure

```
src/
├── components/       # UI components
│   └── ui/           # shadcn/ui primitives
├── contexts/         # Auth context (with demo mode)
├── hooks/            # useTrips, useWallet, useDemoGuard, etc.
├── lib/              # Utilities, destinations, compatibility
├── ml/               # Compatibility model
├── pages/            # Route pages
├── store/            # Zustand global store
└── integrations/     # Supabase client (auto-generated)

supabase/
├── functions/        # Edge Functions
├── migrations/       # SQL migrations
└── seed.sql          # Demo data
```

## 🚢 Deploy to Vercel

1. Push repo to GitHub
2. Import in [Vercel](https://vercel.com/new)
3. Set environment variables (see table above)
4. Deploy — Vercel auto-detects Vite

Or use the deploy button:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/drive-ucsd&env=VITE_SUPABASE_URL,VITE_SUPABASE_PUBLISHABLE_KEY,VITE_SUPABASE_PROJECT_ID,VITE_MAPBOX_ACCESS_TOKEN)

## 🗺 Roadmap

- [ ] Push notifications for ride updates
- [ ] Recurring rides (weekly commute)
- [ ] Venmo / Apple Pay integration
- [ ] Ride pooling (multi-stop routes)
- [ ] iOS / Android wrapper (Capacitor)
- [ ] UCSD SSO authentication

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

[MIT](LICENSE) — Built with ❤️ for the UCSD community.
