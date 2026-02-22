import { useState, useEffect } from 'react';
import { useTrips, DbTrip } from '@/hooks/useTrips';
import { useAuth } from '@/contexts/AuthContext';
import { useMyRequests, requestSeat, getMyRequestForTrip } from '@/hooks/useRideRequests';
import { computeCompatibility, profileToCompatibility } from '@/lib/compatibility';
import { formatDepartureTime } from '@/lib/utils-drive';
import CompatibilityBreakdown from './CompatibilityBreakdown';
import ProfileOverlay from './ProfileOverlay';
import MyRequestsSection from './MyRequestsSection';
import { supabase } from '@/integrations/supabase/client';
import { DESTINATION_NAMES, TRIP_VIBES } from '@/lib/destinations';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, DollarSign, Users, Star, Check, X, Loader2, Inbox, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const TIME_WINDOWS = [
  { value: 'now', label: 'Now' },
  { value: '1hr', label: '< 1 hr' },
  { value: 'today', label: 'Today' },
];

const FeedPage = () => {
  const [destination, setDestination] = useState<string | null>(null);
  const [timeWindow, setTimeWindow] = useState<string | null>(null);
  const [vibeFilter, setVibeFilter] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<'soonest' | 'bestMatch'>('soonest');
  const [feedTab, setFeedTab] = useState<'trips' | 'myRequests'>('trips');
  const { trips, loading, refetch } = useTrips({ destination, timeWindow, sortMode });

  const role = (window as any).__driveState?.role || 'rider';

  // Filter by vibe client-side
  const filteredTrips = vibeFilter
    ? trips.filter(t => (t as any).vibe === vibeFilter)
    : trips;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Rider sub-tabs */}
      {role === 'rider' && (
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1 mb-5">
          {(['trips', 'myRequests'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFeedTab(tab)}
              className={`flex-1 px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-150 ${
                feedTab === tab ? 'bg-card text-card-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'trips' ? 'Available Trips' : 'My Requests'}
            </button>
          ))}
        </div>
      )}

      {feedTab === 'myRequests' && role === 'rider' ? (
        <MyRequestsSection />
      ) : (
        <>
          {/* Destination filters */}
          <div className="flex flex-col gap-3 mb-4">
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setDestination(null)} className={`chip ${!destination ? 'chip-active' : 'chip-inactive'}`}>All</button>
              {DESTINATION_NAMES.slice(0, 7).map(d => (
                <button key={d} onClick={() => setDestination(destination === d ? null : d)} className={`chip ${destination === d ? 'chip-active' : 'chip-inactive'}`}>{d}</button>
              ))}
            </div>

            {/* Vibe filter */}
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setVibeFilter(null)} className={`text-xs px-2.5 py-1 rounded-full transition-all ${!vibeFilter ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground hover:bg-secondary/20'}`}>All vibes</button>
              {TRIP_VIBES.map(v => (
                <button key={v.value} onClick={() => setVibeFilter(vibeFilter === v.value ? null : v.value)} className={`text-xs px-2.5 py-1 rounded-full transition-all ${vibeFilter === v.value ? v.color + ' font-semibold' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>{v.label}</button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <select
                value={timeWindow || ''}
                onChange={e => setTimeWindow(e.target.value || null)}
                className="h-9 px-3 rounded-lg border border-border bg-card text-card-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Any time</option>
                {TIME_WINDOWS.map(tw => <option key={tw.value} value={tw.value}>{tw.label}</option>)}
              </select>
              <div className="flex items-center gap-1 ml-auto bg-muted rounded-lg p-1">
                {(['soonest', 'bestMatch'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setSortMode(mode)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-150 ${
                      sortMode === mode ? 'bg-card text-card-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {mode === 'soonest' ? 'Soonest' : 'Best Match'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredTrips.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg font-display font-semibold text-muted-foreground">No trips found</p>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or create a trip</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredTrips.map((trip, i) => (
                <motion.div key={trip.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <RealTripCard trip={trip} onUpdate={refetch} />
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const RealTripCard = ({ trip, onUpdate }: { trip: DbTrip; onUpdate: () => void }) => {
  const { profile } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [message, setMessage] = useState('');
  const [myRequestStatus, setMyRequestStatus] = useState<string | null>(null);
  const [checkingRequest, setCheckingRequest] = useState(true);

  const driver = trip.driver;
  const role = (window as any).__driveState?.role || 'rider';
  const vibe = TRIP_VIBES.find(v => v.value === (trip as any).vibe);

  useEffect(() => {
    if (!profile || role !== 'rider' || !trip.id) {
      setCheckingRequest(false);
      return;
    }
    if (trip.id.startsWith('mock-')) {
      setCheckingRequest(false);
      return;
    }
    getMyRequestForTrip(trip.id, profile.id).then(result => {
      setMyRequestStatus(result?.status || null);
      setCheckingRequest(false);
    });
  }, [trip.id, profile?.id, role]);

  if (!driver) return null;

  const currentUserCompat = profile ? profileToCompatibility(profile as any) : null;
  const driverCompat = {
    id: driver.id,
    interests: driver.interests || [],
    clubs: driver.clubs || [],
    college: driver.college || '',
    major: driver.major || '',
    year: driver.year || '',
    musicTag: driver.music_tag || undefined,
  };

  const driverObj = {
    id: driver.id, name: driver.preferred_name || 'Driver', preferredName: driver.preferred_name || undefined,
    email: '', year: driver.year || '', major: driver.major || '',
    rating: 5.0, interests: driver.interests || [], clubs: driver.clubs || [],
    college: driver.college || '', musicTag: driver.music_tag || undefined,
    avatarUrl: driver.avatar_url || undefined,
  };

  const compatibility = currentUserCompat && driver.id !== profile?.id ? computeCompatibility(currentUserCompat, driverCompat) : null;
  const isMockTrip = trip.id.startsWith('mock-');

  const handleRequestSeat = async () => {
    if (!profile) return;
    if (isMockTrip) {
      toast.info('Demo trip — sign up as a driver to create real trips!');
      return;
    }
    setRequesting(true);
    const { error } = await requestSeat(trip.id, profile.id, message);
    if (error) {
      toast.error('Failed to request seat');
    } else {
      toast.success('Seat requested! 🎉', { description: 'The driver will review your request.' });
      setMyRequestStatus('pending');
      setShowConfirm(false);
      setMessage('');
      onUpdate();
    }
    setRequesting(false);
  };

  const renderAction = () => {
    if (role !== 'rider') return null;
    if (checkingRequest) return null;

    if (myRequestStatus === 'pending') {
      return (
        <div className="w-full flex items-center justify-center gap-2 py-2 rounded-lg badge-pending text-sm font-medium">
          <Loader2 className="w-4 h-4 animate-spin" /> Requested — Pending
        </div>
      );
    }
    if (myRequestStatus === 'accepted') {
      return (
        <div className="w-full py-2 rounded-lg badge-confirmed text-sm font-medium text-center">
          ✅ You're in!
        </div>
      );
    }
    if (myRequestStatus === 'denied') {
      return (
        <div className="w-full py-2 rounded-lg badge-declined text-sm font-medium text-center">
          Not this time
        </div>
      );
    }

    if (trip.seats_available === 0) {
      return <div className="w-full py-2 rounded-lg bg-muted text-muted-foreground text-sm font-medium text-center">Full</div>;
    }

    return (
      <button
        onClick={() => setShowConfirm(true)}
        className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all"
      >
        Join this trip
      </button>
    );
  };

  return (
    <>
      <div className="card-hover bg-card rounded-xl border border-border p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setShowProfile(true)}
          >
            <div className="w-8 h-8 rounded-full ucsd-gradient flex items-center justify-center text-primary-foreground text-sm font-bold overflow-hidden">
              {driver.avatar_url ? (
                <img src={driver.avatar_url} className="w-full h-full object-cover" alt="" />
              ) : (
                (driver.preferred_name || 'D').charAt(0)
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{driver.preferred_name || 'Driver'}</p>
              <p className="text-xs text-muted-foreground">{driver.year} · {driver.major}</p>
            </div>
          </div>
          {vibe && (
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${vibe.color}`}>{vibe.label}</span>
          )}
        </div>

        {/* Interest tags */}
        {driver.interests && driver.interests.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {driver.interests.slice(0, 3).map(tag => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{tag}</span>
            ))}
          </div>
        )}

        {/* Trip info */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex items-center gap-1.5 text-sm">
            <MapPin className="w-4 h-4 text-primary/60" />
            <span className="font-medium text-foreground">{trip.to_location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <Clock className="w-4 h-4 text-primary/60" />
            <span className="text-muted-foreground">{formatDepartureTime(trip.departure_time)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <DollarSign className="w-4 h-4 text-primary/60" />
            <span className="text-muted-foreground">${trip.comp_rate} suggested</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <Users className="w-4 h-4 text-primary/60" />
            <span className="font-semibold text-muted-foreground">{trip.seats_available}</span>
            <span className="text-muted-foreground">/ {trip.seats_total} seats</span>
          </div>
        </div>

        {trip.notes && <p className="text-xs text-muted-foreground italic mb-3">"{trip.notes}"</p>}

        {/* Compatibility */}
        {compatibility && role === 'rider' && (
          <div className="mb-3">
            <CompatibilityBreakdown result={compatibility} />
          </div>
        )}

        {/* Action */}
        {renderAction()}
      </div>

      {/* Confirm modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4"
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card rounded-2xl p-6 w-full max-w-sm shadow-xl border border-border"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-display text-lg font-bold text-foreground mb-2">Join this trip</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Trip to <strong>{trip.to_location}</strong> · ${trip.comp_rate} suggested
              </p>
              <div className="mb-4">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
                  Add a note (optional)
                </label>
                <input
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="e.g. Heading to PB for sunset"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-ring outline-none"
                  maxLength={120}
                />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowConfirm(false)} className="flex-1 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">Cancel</button>
                <button onClick={handleRequestSeat} disabled={requesting} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-50">
                  {requesting ? 'Requesting...' : 'Request Seat'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile */}
      <ProfileOverlay user={driverObj} open={showProfile} onClose={() => setShowProfile(false)} />
    </>
  );
};

export default FeedPage;
