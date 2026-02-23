
-- Model weights table for ML compatibility model
CREATE TABLE public.model_weights (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_name text NOT NULL UNIQUE,
  weight_value double precision NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.model_weights ENABLE ROW LEVEL SECURITY;

-- Anyone can read weights (needed for inference)
CREATE POLICY "Anyone can read model weights"
ON public.model_weights FOR SELECT
USING (true);

-- Seed default weights (logistic regression priors based on rule-based system)
INSERT INTO public.model_weights (feature_name, weight_value) VALUES
  ('bias', -1.5),
  ('same_college', 0.8),
  ('same_major', 0.6),
  ('major_similarity', 0.3),
  ('year_proximity', 0.4),
  ('interest_jaccard', 1.2),
  ('shared_clubs_norm', 0.9),
  ('personality_similarity', 0.5),
  ('past_shared_rides', 0.7),
  ('historical_rating', 0.6),
  ('shared_connections', 0.4);

-- Index for fast lookup
CREATE INDEX idx_model_weights_feature ON public.model_weights(feature_name);
