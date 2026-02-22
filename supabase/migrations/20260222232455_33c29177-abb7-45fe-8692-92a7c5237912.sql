
-- Add vibe column to trips
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS vibe text DEFAULT NULL;

-- Add campus column to profiles for multi-campus
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS campus text DEFAULT 'UCSD';

-- Create ratings table
CREATE TABLE public.ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  rater_id uuid NOT NULL,
  rated_id uuid NOT NULL,
  score integer NOT NULL CHECK (score >= 1 AND score <= 5),
  comment text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read ratings about them" ON public.ratings FOR SELECT USING (rater_id = auth.uid() OR rated_id = auth.uid());
CREATE POLICY "Users can create ratings" ON public.ratings FOR INSERT WITH CHECK (auth.uid() = rater_id);

-- Create trip_participants table (for ride history tracking)
CREATE TABLE public.trip_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'rider',
  joined_at timestamptz DEFAULT now()
);
ALTER TABLE public.trip_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own participations" ON public.trip_participants FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Trip drivers can insert participants" ON public.trip_participants FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT driver_id FROM public.trips WHERE id = trip_id)
);

-- Create chat_messages table (ephemeral per trip)
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
-- Users can read messages for trips they participate in
CREATE POLICY "Participants can read chat" ON public.chat_messages FOR SELECT USING (
  auth.uid() IN (SELECT user_id FROM public.trip_participants WHERE trip_id = chat_messages.trip_id)
  OR auth.uid() IN (SELECT driver_id FROM public.trips WHERE id = chat_messages.trip_id)
);
CREATE POLICY "Participants can send chat" ON public.chat_messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND (
    auth.uid() IN (SELECT user_id FROM public.trip_participants WHERE trip_id = chat_messages.trip_id)
    OR auth.uid() IN (SELECT driver_id FROM public.trips WHERE id = chat_messages.trip_id)
  )
);

-- Create reports table
CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL,
  reported_id uuid NOT NULL,
  trip_id uuid REFERENCES public.trips(id) ON DELETE SET NULL,
  reason text NOT NULL,
  details text DEFAULT '',
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can create reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Users can read own reports" ON public.reports FOR SELECT USING (auth.uid() = reporter_id);

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
