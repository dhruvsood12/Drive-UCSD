import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface DbTrip {
  id: string;
  driver_id: string;
  from_location: string;
  to_location: string;
  departure_time: string;
  seats_total: number;
  seats_available: number;
  comp_rate: number;
  notes: string;
  coordinates: any;
  created_at: string;
  driver?: {
    id: string;
    preferred_name: string | null;
    college: string | null;
    year: string | null;
    major: string | null;
    interests: string[];
    clubs: string[];
    avatar_url: string | null;
    music_tag: string | null;
    rating?: number;
  };
}

export function useTrips(filters?: { destination?: string | null; timeWindow?: string | null; sortMode?: string }) {
  const [trips, setTrips] = useState<DbTrip[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrips = async () => {
    let query = supabase
      .from('trips')
      .select('*, driver:profiles!trips_driver_id_fkey(id, preferred_name, college, year, major, interests, clubs, avatar_url, music_tag)')
      .order('departure_time', { ascending: true });

    if (filters?.destination) {
      query = query.eq('to_location', filters.destination);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching trips:', error);
      return;
    }

    let result = (data || []) as unknown as DbTrip[];

    // Client-side time filter
    if (filters?.timeWindow) {
      const now = Date.now();
      result = result.filter(t => {
        const dep = new Date(t.departure_time).getTime();
        if (filters.timeWindow === 'now') return dep - now < 30 * 60 * 1000;
        if (filters.timeWindow === '1hr') return dep - now < 60 * 60 * 1000;
        return dep - now < 24 * 60 * 60 * 1000;
      });
    }

    setTrips(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchTrips();
  }, [filters?.destination, filters?.timeWindow]);

  return { trips, loading, refetch: fetchTrips };
}
