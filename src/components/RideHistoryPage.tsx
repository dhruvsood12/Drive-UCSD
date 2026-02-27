import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Users, TrendingUp, Award, Star } from 'lucide-react';
import { DEMO_RIDE_HISTORY, DEMO_USER_STATS } from '@/demo/demoData';

interface HistoryTrip {
  id: string;
  to_location: string;
  departure_time: string;
  driver_id: string;
  driver?: { preferred_name: string | null; college: string | null; major: string | null };
}

const RideHistoryPage = () => {
  const { profile, isDemo } = useAuth();
  const [trips, setTrips] = useState<HistoryTrip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    if (isDemo) {
      setLoading(false);
      return;
    }
    const fetchHistory = async () => {
      const { data: driverTrips } = await supabase
        .from('trips')
        .select('id, to_location, departure_time, driver_id')
        .eq('driver_id', profile.id)
        .order('departure_time', { ascending: false });

      const { data: riderRequests } = await supabase
        .from('ride_requests')
        .select('trip:trips!ride_requests_trip_id_fkey(id, to_location, departure_time, driver_id)')
        .eq('rider_id', profile.id)
        .eq('status', 'accepted');

      const riderTrips = (riderRequests || []).map(r => (r as any).trip).filter(Boolean);
      const allTrips = [...(driverTrips || []), ...riderTrips];
      const seen = new Set<string>();
      const unique = allTrips.filter(t => { if (seen.has(t.id)) return false; seen.add(t.id); return true; });
      unique.sort((a, b) => new Date(b.departure_time).getTime() - new Date(a.departure_time).getTime());
      setTrips(unique as HistoryTrip[]);
      setLoading(false);
    };
    fetchHistory();
  }, [profile?.id, isDemo]);

  // Use demo data
  const showDemo = isDemo || trips.length === 0;
  const totalRides = showDemo ? DEMO_USER_STATS.totalRides : trips.length;
  const topDestination = showDemo ? DEMO_USER_STATS.topDestination : (() => {
    const destMap = new Map<string, number>();
    trips.forEach(t => destMap.set(t.to_location, (destMap.get(t.to_location) || 0) + 1));
    return [...destMap.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
  })();
  const connectionsMade = showDemo ? DEMO_USER_STATS.connectionsMade : Math.min(trips.length * 2, 30);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-page-title mb-1">Ride History</h2>
      <p className="text-body mb-6">Your social ride graph</p>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card-elevated p-4">
          <Users className="w-5 h-5 text-primary mb-2" />
          <p className="text-2xl font-display font-bold text-foreground">{totalRides}</p>
          <p className="text-xs text-muted-foreground">Total Rides</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card-elevated p-4">
          <TrendingUp className="w-5 h-5 text-success mb-2" />
          <p className="text-2xl font-display font-bold text-foreground">{topDestination}</p>
          <p className="text-xs text-muted-foreground">Top Destination</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-elevated p-4">
          <Award className="w-5 h-5 text-secondary mb-2" />
          <p className="text-2xl font-display font-bold text-foreground">{connectionsMade}</p>
          <p className="text-xs text-muted-foreground">Connections Made</p>
        </motion.div>
      </div>

      {/* Badges */}
      {showDemo && (
        <div className="card-elevated p-5 mb-6">
          <h3 className="text-card-title mb-3">🏅 Ride Badges</h3>
          <div className="flex flex-wrap gap-2">
            {DEMO_USER_STATS.badges.map(badge => (
              <span key={badge} className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium">{badge}</span>
            ))}
          </div>
        </div>
      )}

      {/* Social Insights */}
      <div className="card-elevated p-5 mb-6">
        <h3 className="text-card-title mb-3">🔗 Social Insights</h3>
        <div className="flex flex-wrap gap-2">
          {showDemo ? (
            <>
              <span className="chip chip-inactive text-xs">Top: {DEMO_USER_STATS.topDestination}</span>
              {DEMO_USER_STATS.commonCoRiders.map(name => (
                <span key={name} className="chip chip-inactive text-xs">Rides with {name}</span>
              ))}
              <span className="chip chip-inactive text-xs">Connected with {DEMO_USER_STATS.connectionsMade}+ students</span>
            </>
          ) : (
            <>
              <span className="chip chip-inactive text-xs">{topDestination} × {trips.filter(t => t.to_location === topDestination).length}</span>
              <span className="chip chip-inactive text-xs">Connected with {connectionsMade}+ students</span>
              {profile?.college && <span className="chip chip-inactive text-xs">Most matched: {profile.college} students</span>}
            </>
          )}
        </div>
      </div>

      {/* Trip list */}
      <h3 className="text-label mt-6 mb-3">All Rides</h3>
      {showDemo ? (
        <div className="flex flex-col gap-2">
          {DEMO_RIDE_HISTORY.map((ride, i) => (
            <motion.div
              key={ride.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="card-interactive p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={ride.driverAvatar} className="w-9 h-9 rounded-full bg-muted" alt="" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{ride.destination}</p>
                    <p className="text-xs text-muted-foreground">
                      {ride.driverName} · {new Date(ride.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    <Star className="w-3 h-3 text-secondary fill-secondary" />
                    <span className="text-xs font-medium">{ride.rating}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">${ride.cost}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : trips.length === 0 ? (
        <p className="text-body text-center py-8">No rides yet. Request to join a trip!</p>
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
