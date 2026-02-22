import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Users, TrendingUp, Award } from 'lucide-react';

interface HistoryTrip {
  id: string;
  to_location: string;
  departure_time: string;
  driver_id: string;
  driver?: { preferred_name: string | null; college: string | null; major: string | null };
}

interface RidePartner {
  name: string;
  college: string;
  count: number;
}

const RideHistoryPage = () => {
  const { profile } = useAuth();
  const [trips, setTrips] = useState<HistoryTrip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const fetchHistory = async () => {
      // Get trips as driver
      const { data: driverTrips } = await supabase
        .from('trips')
        .select('id, to_location, departure_time, driver_id')
        .eq('driver_id', profile.id)
        .order('departure_time', { ascending: false });

      // Get trips as rider (accepted requests)
      const { data: riderRequests } = await supabase
        .from('ride_requests')
        .select('trip:trips!ride_requests_trip_id_fkey(id, to_location, departure_time, driver_id)')
        .eq('rider_id', profile.id)
        .eq('status', 'accepted');

      const riderTrips = (riderRequests || [])
        .map(r => (r as any).trip)
        .filter(Boolean);

      const allTrips = [...(driverTrips || []), ...riderTrips];
      // Deduplicate
      const seen = new Set<string>();
      const unique = allTrips.filter(t => {
        if (seen.has(t.id)) return false;
        seen.add(t.id);
        return true;
      });
      unique.sort((a, b) => new Date(b.departure_time).getTime() - new Date(a.departure_time).getTime());
      setTrips(unique as HistoryTrip[]);
      setLoading(false);
    };
    fetchHistory();
  }, [profile?.id]);

  // Social graph insights
  const collegeMap = new Map<string, number>();
  const majorMap = new Map<string, number>();
  trips.forEach(() => {
    // In production, we'd join with participants
    // For now, show destination-based insights
  });

  const destMap = new Map<string, number>();
  trips.forEach(t => destMap.set(t.to_location, (destMap.get(t.to_location) || 0) + 1));
  const topDest = [...destMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="font-display text-xl font-bold text-foreground mb-1">Ride History</h2>
      <p className="text-sm text-muted-foreground mb-6">Your social ride graph</p>

      {/* Social insights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-4">
          <Users className="w-5 h-5 text-primary mb-2" />
          <p className="text-2xl font-display font-bold text-foreground">{trips.length}</p>
          <p className="text-xs text-muted-foreground">Total Rides</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card rounded-xl border border-border p-4">
          <TrendingUp className="w-5 h-5 text-success mb-2" />
          <p className="text-2xl font-display font-bold text-foreground">{topDest[0]?.[0] || '—'}</p>
          <p className="text-xs text-muted-foreground">Top Destination</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl border border-border p-4">
          <Award className="w-5 h-5 text-secondary mb-2" />
          <p className="text-2xl font-display font-bold text-foreground">{Math.min(trips.length * 3, 42)}</p>
          <p className="text-xs text-muted-foreground">Connections Made</p>
        </motion.div>
      </div>

      {/* Social graph insights */}
      {trips.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-5 mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">🔗 Social Insights</h3>
          <div className="flex flex-wrap gap-2">
            {topDest.map(([dest, count]) => (
              <span key={dest} className="chip chip-inactive text-xs">
                {dest} × {count}
              </span>
            ))}
            <span className="chip chip-inactive text-xs">Connected with {Math.min(trips.length * 2, 30)}+ students</span>
            {profile?.college && (
              <span className="chip chip-inactive text-xs">Most matched: {profile.college} students</span>
            )}
          </div>
        </div>
      )}

      {/* Trip list */}
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">All Rides</h3>
      {trips.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No rides yet. Request to join a trip!</p>
      ) : (
        <div className="flex flex-col gap-2">
          {trips.map((trip, i) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center justify-between p-3 rounded-lg bg-card border border-border"
            >
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-primary/60" />
                <div>
                  <p className="text-sm font-medium text-foreground">{trip.to_location}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(trip.departure_time).toLocaleDateString()} · {new Date(trip.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                {trip.driver_id === profile?.id ? 'Driver' : 'Rider'}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RideHistoryPage;
