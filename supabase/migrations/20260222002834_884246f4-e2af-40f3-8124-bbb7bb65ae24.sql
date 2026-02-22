
-- Add message column to ride_requests
ALTER TABLE public.ride_requests ADD COLUMN IF NOT EXISTS message text DEFAULT '';

-- Enable realtime for ride_requests so drivers see new requests live
ALTER PUBLICATION supabase_realtime ADD TABLE public.ride_requests;
