import { useState, useEffect } from 'react';
import { useTrips, DbTrip } from '@/hooks/useTrips';
import { useAuth } from '@/contexts/AuthContext';
import { requestSeat, getMyRequestForTrip } from '@/hooks/useRideRequests';
import { dbProfileToFeatureProfile, computeMLCompatibilitySync } from '@/ml';
import { useMLWeights } from '@/hooks/useMLCompatibility';
import { formatDepartureTime } from '@/lib/utils-drive';
import CompatibilityBreakdown from './CompatibilityBreakdown';
import ProfileOverlay from './ProfileOverlay';
import MyRequestsSection from './MyRequestsSection';
import HeroHeader from './HeroHeader';
import ProfileCompleteness from './ProfileCompleteness';
import TripCardSkeleton from './TripCardSkeleton';
import DriverTierBadge from './DriverTierBadge';
import { DESTINATION_NAMES, DESTINATIONS, DESTINATION_CATEGORIES, TRIP_VIBES, VIBE_CATEGORIES } from '@/lib/destinations';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, DollarSign, Users, Star, Loader2, Inbox, Sparkles, Filter, ChevronDown, Shield, X } from 'lucide-react';
import { toast } from 'sonner';

const TIME_WINDOWS = [
  { value: 'now', label: 'Now' },
  { value: '1hr', label: '< 1 hr' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
];

const FeedPage = () => {
  const [destination, setDestination] = useState<string | null>(null);
  const [timeWindow, setTimeWindow] = useState<string | null>(null);
  const [vibeFilter, setVibeFilter] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<'soonest' | 'bestMatch'>('soonest');
  const [feedTab, setFeedTab] = useState<'trips' | 'myRequests'>('trips');
  const [showFilters, setShowFilters] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const { trips, loading, refetch } = useTrips({ destination, timeWindow, sortMode });
  const [showHero, setShowHero] = useState(true);

  const role = (window as any).__driveState?.role || 'rider';
  const { weights: mlWeights } = useMLWeights();

  const filteredTrips = trips.filter(t => {
    if (vibeFilter && (t as any).vibe !== vibeFilter) return false;
    if (maxPrice && Number(t.comp_rate) > maxPrice) return false;
    return true;
  });

  const activeFilterCount = [destination, vibeFilter, timeWindow, maxPrice].filter(Boolean).length;

  return (
    <div className="max-w-2xl mx-auto">
      {showHero && feedTab === 'trips' && (
        <div className="relative">
          <HeroHeader />
          <button
            onClick={() => setShowHero(false)}
            className="absolute top-3 right-3 p-1 rounded-full bg-primary-foreground/10 text-primary-foreground/50 hover:text-primary-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <ProfileCompleteness />

      {/* Rider sub-tabs */}
      {role === 'rider' && (
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1 mb-5">
          {(['trips', 'myRequests'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFeedTab(tab)}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 ${
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
          {/* Filter bar */}
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 chip ${showFilters || activeFilterCount > 0 ? 'chip-active' : 'chip-inactive'}`}
            >
              <Filter className="w-3.5 h-3.5" />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-secondary text-secondary-foreground text-xs font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <select
              value={timeWindow || ''}
              onChange={e => setTimeWindow(e.target.value || null)}
              className="h-9 px-3 rounded-lg border border-border bg-card text-card-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Any time</option>
              {TIME_WINDOWS.map(tw => <option key={tw.value} value={tw.value}>{tw.label}</option>)}
            </select>

            <select
              value={vibeFilter || ''}
              onChange={e => setVibeFilter(e.target.value || null)}
              className="h-9 px-3 rounded-lg border border-border bg-card text-card-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All vibes</option>
              {VIBE_CATEGORIES.map(cat => (
                <optgroup key={cat.key} label={cat.label}>
                  {TRIP_VIBES.filter(v => v.category === cat.key).map(v => (
                    <option key={v.value} value={v.value}>{v.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>

            <div className="flex items-center gap-1 ml-auto bg-muted rounded-lg p-1">
              {(['soonest', 'bestMatch'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setSortMode(mode)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
                    sortMode === mode ? 'bg-card text-card-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {mode === 'soonest' ? 'Soonest' : '✨ Match'}
                </button>
              ))}
            </div>
          </div>

          {/* Expandable filter panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-4"
              >
                <div className="bg-card rounded-xl border border-border p-4 space-y-4">
                  {/* Destinations by category */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Destination</p>
                    <div className="space-y-2">
                      {DESTINATION_CATEGORIES.map(cat => (
                        <div key={cat.key}>
                          <p className="text-xs text-muted-foreground mb-1">{cat.label}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {DESTINATIONS.filter(d => d.category === cat.key).map(d => (
                              <button
                                key={d.name}
                                onClick={() => setDestination(destination === d.name ? null : d.name)}
                                className={`text-xs px-2.5 py-1 rounded-full transition-all ${
                                  destination === d.name ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-primary/10'
                                }`}
                              >
                                {d.icon} {d.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Max price */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Max Price</p>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={0}
                        max={30}
                        value={maxPrice || 30}
                        onChange={e => setMaxPrice(Number(e.target.value) === 30 ? null : Number(e.target.value))}
                        className="flex-1 accent-primary"
                      />
                      <span className="text-sm font-medium text-foreground w-12">
                        {maxPrice ? `$${maxPrice}` : 'Any'}
                      </span>
                    </div>
                  </div>

                  {/* Clear */}
                  {activeFilterCount > 0 && (
                    <button
                      onClick={() => { setDestination(null); setVibeFilter(null); setTimeWindow(null); setMaxPrice(null); }}
                      className="text-xs text-destructive font-medium hover:underline"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {loading ? (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map(i => <TripCardSkeleton key={i} />)}
            </div>
          ) : filteredTrips.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Inbox className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-lg font-display font-semibold text-muted-foreground">No trips found</p>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or create a trip</p>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredTrips.map((trip, i) => (
                <motion.div key={trip.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <RealTripCard trip={trip} onUpdate={refetch} mlWeights={mlWeights} />
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const RealTripCard = ({ trip, onUpdate, mlWeights }: { trip: DbTrip; onUpdate: () => void; mlWeights: any }) => {
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

  const driverObj = {
    id: driver.id, name: driver.preferred_name || 'Driver', preferredName: driver.preferred_name || undefined,
    email: '', year: driver.year || '', major: driver.major || '',
    rating: 5.0, interests: driver.interests || [], clubs: driver.clubs || [],
    college: driver.college || '', musicTag: driver.music_tag || undefined,
    avatarUrl: driver.avatar_url || undefined,
  };

  // ML Compatibility
  const compatibility = (() => {
    if (!profile || driver.id === profile?.id) return null;
    const a = dbProfileToFeatureProfile(profile as any);
    const b = dbProfileToFeatureProfile(driver as any);
    return computeMLCompatibilitySync(a, b, mlWeights);
  })();
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
    if (checkingRequest) return <div className="h-10 skeleton" />;

    if (myRequestStatus === 'pending') {
      return (
        <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg badge-pending text-sm font-medium">
          <Loader2 className="w-4 h-4 animate-spin" /> Requested
        </div>
      );
    }
    if (myRequestStatus === 'accepted') {
      return (
        <div className="w-full py-2.5 rounded-lg badge-confirmed text-sm font-medium text-center">
          ✅ You're in!
        </div>
      );
    }
    if (myRequestStatus === 'denied') {
      return (
        <div className="w-full py-2.5 rounded-lg badge-declined text-sm font-medium text-center">
          Not this time
        </div>
      );
    }

    if (trip.seats_available === 0) {
      return <div className="w-full py-2.5 rounded-lg bg-muted text-muted-foreground text-sm font-medium text-center">Full</div>;
    }

    return (
      <button
        onClick={() => setShowConfirm(true)}
        className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all active:scale-[0.98]"
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
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => window.location.href = `/profile/${driver.id}`}
          >
            <div className="w-10 h-10 rounded-full triton-gradient flex items-center justify-center text-primary-foreground text-sm font-bold overflow-hidden ring-2 ring-border">
              {driver.avatar_url ? (
                <img src={driver.avatar_url} className="w-full h-full object-cover" alt="" />
              ) : (
                (driver.preferred_name || 'D').charAt(0)
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-foreground">{driver.preferred_name || 'Driver'}</p>
                <Shield className="w-3 h-3 text-success" />
              </div>
              <p className="text-xs text-muted-foreground">{driver.year} · {driver.major} · {driver.college}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {vibe && (
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${vibe.color}`}>{vibe.label}</span>
            )}
          </div>
        </div>

        {/* Interest tags */}
        {driver.interests && driver.interests.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {driver.interests.slice(0, 4).map(tag => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{tag}</span>
            ))}
            {driver.interests.length > 4 && (
              <span className="text-xs text-muted-foreground">+{driver.interests.length - 4}</span>
            )}
          </div>
        )}

        {/* Trip info */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex items-center gap-1.5 text-sm">
            <MapPin className="w-4 h-4 text-primary/60 shrink-0" />
            <span className="font-medium text-foreground truncate">{trip.to_location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <Clock className="w-4 h-4 text-primary/60 shrink-0" />
            <span className="text-muted-foreground">{formatDepartureTime(trip.departure_time)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <DollarSign className="w-4 h-4 text-primary/60 shrink-0" />
            <span className="text-muted-foreground">${trip.comp_rate} suggested</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <Users className="w-4 h-4 text-primary/60 shrink-0" />
            <span className="font-semibold text-foreground">{trip.seats_available}</span>
            <span className="text-muted-foreground">/ {trip.seats_total} seats</span>
          </div>
        </div>

        {trip.notes && <p className="text-xs text-muted-foreground italic mb-3 line-clamp-2">"{trip.notes}"</p>}

        {/* Compatibility */}
        {compatibility && role === 'rider' && (
          <div className="mb-3">
            <CompatibilityBreakdown result={compatibility} />
          </div>
        )}

        {/* Rating + tier */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1 text-xs">
            <Star className="w-3.5 h-3.5 text-secondary fill-secondary" />
            <span className="font-semibold text-foreground">{(driver as any).rating || '5.0'}</span>
          </div>
          <DriverTierBadge rideCount={5} />
        </div>

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
                <button onClick={() => setShowConfirm(false)} className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">Cancel</button>
                <button onClick={handleRequestSeat} disabled={requesting} className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-50">
                  {requesting ? 'Requesting...' : 'Request Seat'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </>
  );
};

export default FeedPage;
