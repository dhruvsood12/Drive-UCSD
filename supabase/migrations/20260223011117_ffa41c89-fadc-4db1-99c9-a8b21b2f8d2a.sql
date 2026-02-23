
-- Add status column to trips for lifecycle management
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'upcoming';

-- Add from_location default if missing
-- ALTER TABLE public.trips ALTER COLUMN from_location SET DEFAULT 'UC San Diego';

-- Add flexibility_minutes for departure flexibility
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS flexibility_minutes integer DEFAULT 0;

-- Add started_at and completed_at for ride lifecycle
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS started_at timestamp with time zone;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS completed_at timestamp with time zone;

-- Create index on status for efficient filtering
CREATE INDEX IF NOT EXISTS idx_trips_status ON public.trips (status);
CREATE INDEX IF NOT EXISTS idx_trips_departure_time ON public.trips (departure_time);

-- Create a function to auto-expire old trips
CREATE OR REPLACE FUNCTION public.expire_old_trips()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.trips
  SET status = 'expired'
  WHERE status IN ('upcoming', 'active')
    AND departure_time < (now() - interval '5 minutes');
END;
$$;

-- Enable realtime for trips table updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.trips;
