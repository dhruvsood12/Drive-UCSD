
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  preferred_name TEXT,
  role TEXT CHECK (role IN ('driver', 'rider', 'both')),
  college TEXT,
  year TEXT,
  major TEXT,
  interests TEXT[] DEFAULT '{}',
  clubs TEXT[] DEFAULT '{}',
  age INT,
  gender TEXT,
  avatar_url TEXT,
  music_tag TEXT,
  onboarding_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Create trips table
CREATE TABLE public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  from_location TEXT DEFAULT 'UC San Diego',
  to_location TEXT NOT NULL,
  departure_time TIMESTAMPTZ NOT NULL,
  seats_total INT NOT NULL DEFAULT 4,
  seats_available INT NOT NULL DEFAULT 4,
  comp_rate NUMERIC DEFAULT 0,
  notes TEXT DEFAULT '',
  coordinates JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read trips" ON public.trips FOR SELECT USING (true);
CREATE POLICY "Drivers can create trips" ON public.trips FOR INSERT WITH CHECK (auth.uid() = driver_id);
CREATE POLICY "Drivers can update own trips" ON public.trips FOR UPDATE USING (auth.uid() = driver_id);
CREATE POLICY "Drivers can delete own trips" ON public.trips FOR DELETE USING (auth.uid() = driver_id);

-- Create ride_requests table
CREATE TABLE public.ride_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  rider_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.ride_requests ENABLE ROW LEVEL SECURITY;

-- Riders can see their own requests, drivers can see requests for their trips
CREATE POLICY "Users can read own requests" ON public.ride_requests FOR SELECT
  USING (auth.uid() = rider_id OR auth.uid() IN (SELECT driver_id FROM public.trips WHERE id = trip_id));
CREATE POLICY "Riders can create requests" ON public.ride_requests FOR INSERT WITH CHECK (auth.uid() = rider_id);
CREATE POLICY "Trip drivers can update requests" ON public.ride_requests FOR UPDATE
  USING (auth.uid() IN (SELECT driver_id FROM public.trips WHERE id = trip_id));

-- Storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
