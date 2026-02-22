import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Car, Star, Sparkles, MapPin } from 'lucide-react';

interface TripEarning {
  id: string;
  to_location: string;
  departure_time: string;
  comp_rate: number;
  seats_total: number;
  seats_available: number;
}

const EarningsPage = () => {
  const { profile } = useAuth();
  const [trips, setTrips] = useState<TripEarning[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const fetchTrips = async () => {
      const { data } = await supabase
        .from('trips')
        .select('id, to_location, departure_time, comp_rate, seats_total, seats_available')
        .eq('driver_id', profile.id)
        .order('departure_time', { ascending: false });
      setTrips((data || []) as TripEarning[]);
      setLoading(false);
    };
    fetchTrips();
  }, [profile?.id]);

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000);
  const monthAgo = new Date(now.getTime() - 30 * 86400000);

  const pastTrips = trips.filter(t => new Date(t.departure_time) < now);
  const weekTrips = pastTrips.filter(t => new Date(t.departure_time) > weekAgo);
  const monthTrips = pastTrips.filter(t => new Date(t.departure_time) > monthAgo);

  const totalEarnings = pastTrips.reduce((s, t) => s + (t.comp_rate * (t.seats_total - t.seats_available)), 0);
  const weekEarnings = weekTrips.reduce((s, t) => s + (t.comp_rate * (t.seats_total - t.seats_available)), 0);
  const monthEarnings = monthTrips.reduce((s, t) => s + (t.comp_rate * (t.seats_total - t.seats_available)), 0);
  const totalRides = pastTrips.length;

  // Demo values for display
  const avgRating = 4.8;
  const avgCompat = 72;

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="font-display text-xl font-bold text-foreground mb-1">Driver Earnings</h2>
      <p className="text-sm text-muted-foreground mb-6">Track your rides and earnings</p>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <StatCard icon={<DollarSign className="w-5 h-5" />} label="This Week" value={`$${weekEarnings}`} color="text-success" />
        <StatCard icon={<TrendingUp className="w-5 h-5" />} label="This Month" value={`$${monthEarnings}`} color="text-primary" />
        <StatCard icon={<DollarSign className="w-5 h-5" />} label="All Time" value={`$${totalEarnings}`} color="text-secondary" />
        <StatCard icon={<Car className="w-5 h-5" />} label="Total Rides" value={String(totalRides)} color="text-foreground" />
        <StatCard icon={<Star className="w-5 h-5" />} label="Avg Rating" value={String(avgRating)} color="text-warning" />
        <StatCard icon={<Sparkles className="w-5 h-5" />} label="Avg Compatibility" value={`${avgCompat}%`} color="text-info" />
      </div>

      {/* Fare calculator */}
      <FareCalculator />

      {/* Recent trips */}
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 mt-6">Recent Trips</h3>
      {pastTrips.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No completed trips yet. Start driving!</p>
      ) : (
        <div className="flex flex-col gap-2">
          {pastTrips.slice(0, 10).map((trip, i) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center justify-between p-3 rounded-lg bg-card border border-border"
            >
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-primary/60" />
                <div>
                  <p className="text-sm font-medium text-foreground">{trip.to_location}</p>
                  <p className="text-xs text-muted-foreground">{new Date(trip.departure_time).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-success">+${trip.comp_rate * (trip.seats_total - trip.seats_available)}</p>
                <p className="text-xs text-muted-foreground">{trip.seats_total - trip.seats_available} riders</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-card rounded-xl border border-border p-4"
  >
    <div className={`mb-2 ${color}`}>{icon}</div>
    <p className={`text-xl font-display font-bold ${color}`}>{value}</p>
    <p className="text-xs text-muted-foreground">{label}</p>
  </motion.div>
);

const FareCalculator = () => {
  const [distance, setDistance] = useState(10);
  const baseFare = 3;
  const perMile = 0.8;
  const suggested = Math.round(baseFare + distance * perMile);

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="text-sm font-semibold text-foreground mb-3">💡 Suggested Fare Calculator</h3>
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label className="text-xs text-muted-foreground block mb-1">Distance (miles)</label>
          <input
            type="range"
            min={1}
            max={40}
            value={distance}
            onChange={e => setDistance(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <p className="text-xs text-muted-foreground mt-1">{distance} miles</p>
        </div>
        <div className="text-center px-4 py-3 bg-primary/10 rounded-lg">
          <p className="text-2xl font-display font-bold text-primary">${suggested}</p>
          <p className="text-xs text-muted-foreground">per rider</p>
        </div>
      </div>
    </div>
  );
};

export default EarningsPage;
