# 🔱 Drive UCSD

**Campus ridesharing built for UCSD students — find compatible rides, split costs, and travel together.**

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)](https://typescriptlang.org)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev)

<!-- 
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen.svg)](https://drive-ucsd.vercel.app)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/drive-ucsd)
-->

---

## ✨ Features

- **Smart Matching** — Compatibility scores based on shared interests, clubs, music taste, and personality traits using cosine similarity
- **Interactive Map** — Mapbox-powered map with clustered ride pins, direction filters, and heatmap demand overlay
- **Ride Lifecycle** — Full state machine: upcoming → active → departed → completed / expired
- **Group Chat** — Real-time in-trip chat with system messages, quick actions, and auto-lock after completion
- **Departure Coordination** — Flexible departure windows with rider confirmation flow
- **Wallet & Payments** — In-app balance system for ride compensation
- **Safety** — User reporting, blocking, admin moderation dashboard, and account suspension
- **Driver Profiles** — Vehicle registration, tier badges, and driver-specific earnings view

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
# Fill in your Supabase and Mapbox keys (see Environment Variables below)

# 4. Run
npm run dev
```

Open [http://localhost:8080](http://localhost:8080).

## 🔑 Environment Variables

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `VITE_SUPABASE_URL` | Supabase project URL | [Supabase Dashboard](https://supabase.com/dashboard) → Settings → API |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key | Same as above |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ID | Same as above |
| `VITE_MAPBOX_ACCESS_TOKEN` | Mapbox public token | [Mapbox Account](https://account.mapbox.com/access-tokens/) |

## 🧠 How Matching Works

1. Each user's profile is encoded into a feature vector (interests, clubs, music, personality traits)
2. When viewing a trip, the rider's vector is compared against the driver's using **cosine similarity**
3. Bonus points are added for shared college, overlapping clubs, and compatible vibes
4. The final score (0–100%) is displayed on each trip card with a breakdown

See [docs/architecture.md](docs/architecture.md) for implementation details.

## 🗄 Database

The app uses 13 tables with Row-Level Security on every table. Key entities:

- **profiles** — User identity, preferences, personality
- **trips** — Posted rides with status lifecycle
- **ride_requests** — Rider applications (pending/confirmed/declined)
- **chat_messages** — Real-time group chat per trip
- **wallets** — In-app balance

Full schema documentation: [docs/schema.md](docs/schema.md)

## 📁 Project Structure

```
src/
├── components/       # UI components
│   └── ui/           # shadcn/ui primitives
├── contexts/         # Auth context
├── hooks/            # useTrips, useWallet, useRideRequests, etc.
├── lib/              # Utilities, destinations, compatibility logic
├── ml/               # Compatibility model
├── pages/            # Route pages
├── store/            # Zustand global store
└── integrations/     # Supabase client (auto-generated)

supabase/
├── functions/        # Edge Functions
└── migrations/       # SQL migrations
```

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
