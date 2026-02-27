import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Car, Star, MapPin, BarChart3, Calendar, ArrowRight } from 'lucide-react';
import DriverTierBadge from './DriverTierBadge';
import { DEMO_WEEKLY_EARNINGS, DEMO_DRIVER_STATS, DEMO_NEXT_RIDE, DEMO_GROWTH_TIPS } from '@/demo/demoData';

interface TripEarning {
  id: string;
  to_location: string;
  departure_time: string;
  comp_rate: number;
  seats_total: number;
  seats_available: number;
}

const EarningsPage = () => {
  const { profile, isDemo } = useAuth();
  const [trips, setTrips] = useState<TripEarning[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile || isDemo) {
      setLoading(false);
      return;
    }
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
  }, [profile?.id, isDemo]);

  // Demo data
  const demoTrips: TripEarning[] = useMemo(() => [
    { id: 'dt1', to_location: 'Pacific Beach', departure_time: new Date(Date.now() - 2 * 3600000).toISOString(), comp_rate: 5, seats_total: 4, seats_available: 1 },
    { id: 'dt2', to_location: 'Downtown Gaslamp', departure_time: new Date(Date.now() - 24 * 3600000).toISOString(), comp_rate: 8, seats_total: 4, seats_available: 1 },
    { id: 'dt3', to_location: 'Airport', departure_time: new Date(Date.now() - 48 * 3600000).toISOString(), comp_rate: 15, seats_total: 4, seats_available: 2 },
    { id: 'dt4', to_location: 'Convoy St', departure_time: new Date(Date.now() - 72 * 3600000).toISOString(), comp_rate: 6, seats_total: 3, seats_available: 0 },
    { id: 'dt5', to_location: 'La Jolla Cove', departure_time: new Date(Date.now() - 96 * 3600000).toISOString(), comp_rate: 4, seats_total: 3, seats_available: 1 },
    { id: 'dt6', to_location: 'UTC Westfield', departure_time: new Date(Date.now() - 120 * 3600000).toISOString(), comp_rate: 3, seats_total: 3, seats_available: 1 },
    { id: 'dt7', to_location: 'Hillcrest', departure_time: new Date(Date.now() - 144 * 3600000).toISOString(), comp_rate: 7, seats_total: 4, seats_available: 2 },
    { id: 'dt8', to_location: 'Ocean Beach', departure_time: new Date(Date.now() - 168 * 3600000).toISOString(), comp_rate: 5, seats_total: 3, seats_available: 0 },
  ], []);

  const activeTrips = isDemo ? demoTrips : trips;
  const now = new Date();
  const pastTrips = activeTrips.filter(t => new Date(t.departure_time) < now);

  const earning = (t: TripEarning) => t.comp_rate * (t.seats_total - t.seats_available);
  const totalEarnings = pastTrips.reduce((s, t) => s + earning(t), 0);
  const totalRides = pastTrips.length;
  const completionRate = activeTrips.length > 0 ? Math.round((pastTrips.length / activeTrips.length) * 100) : 0;

  const computedWeekly = useMemo(() => {
    if (isDemo) return DEMO_WEEKLY_EARNINGS;
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dayStr = d.toLocaleDateString(undefined, { weekday: 'short' });
      const dayTrips = pastTrips.filter(t => {
        const td = new Date(t.departure_time);
        return td.toDateString() === d.toDateString();
      });
      const amount = dayTrips.reduce((s, t) => s + earning(t), 0);
      days.push({ day: dayStr, amount });
    }
    return days;
  }, [pastTrips, isDemo]);
  const weeklyData = computedWeekly;

  const maxAmount = Math.max(...weeklyData.map(d => d.amount), 1);
  const weekTotal = weeklyData.reduce((s, d) => s + d.amount, 0);

  // Top destination
  const destMap = new Map<string, number>();
  pastTrips.forEach(t => destMap.set(t.to_location, (destMap.get(t.to_location) || 0) + 1));
  const topDest = [...destMap.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

  // Next scheduled ride (demo)
  const nextRide = isDemo ? { destination: DEMO_NEXT_RIDE.destination, time: new Date(DEMO_NEXT_RIDE.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), riders: DEMO_NEXT_RIDE.riders } : null;

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-page-title mb-1">Driver Dashboard</h2>
          <p className="text-body">Track your rides, earnings, and growth</p>
        </div>
        <DriverTierBadge rideCount={totalRides} />
      </div>

      {/* Next ride card */}
      {nextRide && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="triton-gradient rounded-2xl p-5 mb-5 text-primary-foreground">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs opacity-70 uppercase tracking-wider font-semibold mb-1">Next Scheduled Ride</p>
              <p className="text-xl font-display font-bold">{nextRide.destination}</p>
              <p className="text-sm opacity-80 mt-0.5">{nextRide.time} · {nextRide.riders} riders confirmed</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <StatCard icon={<DollarSign className="w-5 h-5" />} label="This Week" value={`$${weekTotal}`} color="text-success" />
        <StatCard icon={<TrendingUp className="w-5 h-5" />} label="All Time" value={`$${totalEarnings}`} color="text-primary" />
        <StatCard icon={<Car className="w-5 h-5" />} label="Total Rides" value={String(totalRides)} color="text-foreground" />
        <StatCard icon={<Star className="w-5 h-5" />} label="Completion" value={`${completionRate}%`} color="text-warning" />
      </div>

      {/* Weekly earnings chart */}
      <div className="card-elevated p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h3 className="text-card-title">Weekly Earnings</h3>
          </div>
          <span className="text-sm font-bold text-success">${weekTotal}</span>
        </div>
        <div className="flex items-end gap-2 h-28">
          {weeklyData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] font-medium text-foreground">{d.amount > 0 ? `$${d.amount}` : ''}</span>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(d.amount / maxAmount) * 100}%` }}
                transition={{ delay: i * 0.06, duration: 0.5, ease: 'easeOut' }}
                className="w-full rounded-t-lg bg-primary/80 min-h-[4px]"
              />
              <span className="text-[10px] text-muted-foreground font-medium">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Growth tips */}
      <div className="card-elevated p-5 mb-5">
        <h3 className="text-card-title mb-3">💡 Growth Tips</h3>
        <div className="space-y-2.5">
          {(isDemo ? DEMO_GROWTH_TIPS : [
            `Post trips during peak hours (7-9am, 4-7pm) for more riders`,
            `Your top destination is ${topDest} — try new routes for variety`,
            `Complete your profile to boost compatibility scores`,
            `Maintain a high rating by being punctual and friendly`,
          ]).map((tip, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold shrink-0 mt-0.5">Tip</span>
              <p className="text-xs text-muted-foreground">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Fare calculator */}
      <FareCalculator />

      {/* Recent trips */}
      <h3 className="text-label mt-6 mb-3">Recent Trips</h3>
      {pastTrips.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-muted flex items-center justify-center">
            <Car className="w-6 h-6 text-muted-foreground/40" />
          </div>
          <p className="text-body">No completed trips yet. Start driving!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {pastTrips.slice(0, 10).map((trip, i) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="card-interactive p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{trip.to_location}</p>
                    <p className="text-xs text-muted-foreground">{new Date(trip.departure_time).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-success">+${earning(trip)}</p>
                  <p className="text-xs text-muted-foreground">{trip.seats_total - trip.seats_available} riders</p>
                </div>
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
    className="card-elevated p-4"
  >
    <div className={`mb-2 ${color}`}>{icon}</div>
    <p className={`text-xl font-display font-bold ${color} truncate`}>{value}</p>
    <p className="text-xs text-muted-foreground">{label}</p>
  </motion.div>
);

const FareCalculator = () => {
  const [distance, setDistance] = useState(10);
  const baseFare = 3;
  const perMile = 0.8;
  const suggested = Math.round(baseFare + distance * perMile);

  return (
    <div className="card-elevated p-5">
      <h3 className="text-card-title mb-3">💰 Suggested Fare Calculator</h3>
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label className="text-label block mb-1">Distance (miles)</label>
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
        <div className="text-center px-4 py-3 bg-primary/10 rounded-xl">
          <p className="text-2xl font-display font-bold text-primary">${suggested}</p>
          <p className="text-xs text-muted-foreground">per rider</p>
        </div>
      </div>
    </div>
  );
};

export default EarningsPage;
