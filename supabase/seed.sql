-- ============================================================
-- Drive UCSD — Demo Seed Data
-- Run this in your Supabase SQL Editor to populate the app
-- with sample users and trips for demonstration purposes.
-- ============================================================

-- 1) Demo user profiles (these are NOT real auth users,
--    they populate the feed via mock data merging)
-- Note: The app uses client-side mock data (src/lib/mockTripsData.ts)
-- that automatically populates the feed. This seed file adds
-- realistic trips to the database for a richer demo.

-- If you have real auth users, you can insert trips for them.
-- Otherwise, the mock data system handles the demo experience.

-- Example trips (uncomment and replace driver_id with real user UUIDs):

-- INSERT INTO public.trips (driver_id, to_location, from_location, departure_time, seats_total, seats_available, comp_rate, notes, vibe, status, coordinates)
-- VALUES
--   ('REAL_USER_UUID', 'Pacific Beach', 'UC San Diego', now() + interval '30 minutes', 4, 3, 5, 'Chill beach trip 🏖️', 'chill', 'upcoming', '{"lat": 32.7946, "lng": -117.2535}'),
--   ('REAL_USER_UUID', 'Downtown', 'UC San Diego', now() + interval '1 hour', 3, 2, 7, 'Dinner in Gaslamp 🍜', 'social', 'upcoming', '{"lat": 32.7157, "lng": -117.1611}'),
--   ('REAL_USER_UUID', 'Airport', 'UC San Diego', now() + interval '3 hours', 4, 4, 15, 'SAN airport drop-off ✈️', 'quiet', 'upcoming', '{"lat": 32.7338, "lng": -117.1933}'),
--   ('REAL_USER_UUID', 'UTC', 'UC San Diego', now() + interval '45 minutes', 2, 1, 3, 'Quick Target run 🎯', 'chill', 'upcoming', '{"lat": 32.8716, "lng": -117.2125}'),
--   ('REAL_USER_UUID', 'La Jolla Cove', 'UC San Diego', now() + interval '2 hours', 3, 3, 4, 'Sunset at the cove 🌅', 'chill', 'upcoming', '{"lat": 32.8490, "lng": -117.2726}'),
--   ('REAL_USER_UUID', 'Convoy', 'UC San Diego', now() + interval '1.5 hours', 4, 3, 5, 'Ramen night 🍜', 'social', 'upcoming', '{"lat": 32.8208, "lng": -117.1545}');

-- ============================================================
-- NOTE: The app ships with 20 mock trips (src/lib/mockTripsData.ts)
-- that render automatically when the database is empty.
-- Demo mode uses these mocks + any real DB trips seamlessly.
-- ============================================================
