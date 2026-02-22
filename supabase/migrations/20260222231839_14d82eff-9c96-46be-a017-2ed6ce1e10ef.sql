
-- Add personality and preference columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS personality_talk text DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS personality_music text DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS personality_schedule text DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS personality_social text DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS clean_car_pref text DEFAULT NULL;
