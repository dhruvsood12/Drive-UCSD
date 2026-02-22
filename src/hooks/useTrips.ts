import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_DB_TRIPS } from '@/lib/mockTripsData';

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

    // Merge in mock data so the feed always looks populated
    const dbIds = new Set(result.map(t => t.id));
    let mockFallback = MOCK_DB_TRIPS.filter(t => !dbIds.has(t.id));
    // Apply destination filter to mock data (DB query already filters real data)
    if (filters?.destination) {
      mockFallback = mockFallback.filter(t => t.to_location === filters.destination);
    }
    result = [...result, ...mockFallback];

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

    // Re-sort by departure time
    result.sort((a, b) => new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime());

    setTrips(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchTrips();
  }, [filters?.destination, filters?.timeWindow]);

  return { trips, loading, refetch: fetchTrips };
}
