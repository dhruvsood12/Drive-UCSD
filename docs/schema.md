# Database Schema

## Entity Relationship

```
profiles 1──∞ trips          (driver_id)
profiles 1──∞ ride_requests  (rider_id)
trips    1──∞ ride_requests  (trip_id)
trips    1──∞ trip_participants (trip_id)
trips    1──∞ chat_messages  (trip_id)
trips    1──∞ ratings        (trip_id)
trips    1──∞ payments       (trip_id)
profiles 1──∞ wallets        (user_id)
profiles 1──∞ driver_vehicles (user_id)
profiles 1──∞ user_blocks    (blocker_id / blocked_id)
profiles 1──∞ reports        (reporter_id / reported_id)
profiles 1──∞ user_roles     (user_id)
```

## Tables

### profiles
User identity and preferences. Created on signup.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | Matches auth.users.id |
| email | text | UCSD email |
| preferred_name | text | Display name |
| role | text | rider / driver / both |
| year, major, college | text | Academic info |
| interests, clubs | text[] | For compatibility matching |
| personality_* | text | Talk, music, schedule, social prefs |
| onboarding_complete | boolean | Gates app access |
| suspended | boolean | Admin-controlled |

### trips
Rides posted by drivers.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| driver_id | uuid (FK → profiles) | |
| to_location | text | Destination name |
| from_location | text | Default: UC San Diego |
| departure_time | timestamptz | |
| status | text | upcoming / active / departed / expired / completed |
| seats_available / seats_total | int | |
| comp_rate | numeric | Suggested compensation |
| flexibility_minutes | int | ± window for departure |
| coordinates | jsonb | {lat, lng} for map pin |
| vibe | text | chill / music / quiet / social |

### ride_requests
Rider applications to join a trip.

| Column | Type | Notes |
|--------|------|-------|
| trip_id | uuid (FK → trips) | |
| rider_id | uuid (FK → profiles) | |
| status | text | pending / confirmed / declined |
| message | text | Optional note to driver |

### chat_messages
In-trip group chat.

| Column | Type | Notes |
|--------|------|-------|
| trip_id | uuid (FK → trips) | |
| sender_id | uuid | |
| content | text | Supports system messages |

### wallets
In-app balance for payments.

| Column | Type | Notes |
|--------|------|-------|
| user_id | uuid | |
| balance | numeric | Default: 100.00 |

### Other Tables
- **ratings** — Post-trip scores (1-5) with comments
- **payments** — Peer-to-peer payment records
- **driver_vehicles** — Car make/model/year/plate/color
- **reports** — User reports with admin resolution workflow
- **user_blocks** — Block list
- **user_roles** — Admin/moderator role assignments
- **model_weights** — ML compatibility model parameters
