import { useState } from 'react';
import { useDriverRequests, acceptRequest, denyRequest, RideRequestRow } from '@/hooks/useRideRequests';
import { useAuth } from '@/contexts/AuthContext';
import { dbProfileToFeatureProfile, computeMLCompatibilitySync } from '@/ml';
import { useMLWeights } from '@/hooks/useMLCompatibility';
import { formatDepartureTime } from '@/lib/utils-drive';
import CompatibilityBreakdown from './CompatibilityBreakdown';
import ProfileOverlay from './ProfileOverlay';
import { User } from '@/types';
import { motion } from 'framer-motion';
import { MapPin, Clock, Users, Check, X, Loader2, UserCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const DriverRequestsPage = () => {
  const { requests, loading, refetch } = useDriverRequests();
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const pastRequests = requests.filter(r => r.status !== 'pending');

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="font-display text-xl font-bold text-foreground mb-1">Ride Requests</h2>
      <p className="text-sm text-muted-foreground mb-5">Review who wants to join your trips</p>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : pendingRequests.length === 0 && pastRequests.length === 0 ? (
        <div className="text-center py-16">
          <UserCircle className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-lg font-display font-semibold text-muted-foreground">No requests yet</p>
          <p className="text-sm text-muted-foreground mt-1">When riders want to join your trips, they'll appear here</p>
        </div>
      ) : (
        <>
          {pendingRequests.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Pending ({pendingRequests.length})
              </h3>
              <div className="flex flex-col gap-3">
                {pendingRequests.map((req, i) => (
                  <motion.div key={req.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <RequestCard request={req} onAction={refetch} />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {pastRequests.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Past Decisions
              </h3>
              <div className="flex flex-col gap-3">
                {pastRequests.map((req, i) => (
                  <motion.div key={req.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <RequestCard request={req} onAction={refetch} readonly />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const RequestCard = ({ request, onAction, readonly }: { request: RideRequestRow; onAction: () => void; readonly?: boolean }) => {
  const { profile } = useAuth();
  const { weights: mlWeights } = useMLWeights();
  const [showProfile, setShowProfile] = useState(false);
  const [acting, setActing] = useState<'accept' | 'deny' | null>(null);

  const rider = request.rider;
  const trip = request.trip;
  if (!rider || !trip) return null;

  const riderObj: User = {
    id: rider.id, name: rider.preferred_name || 'Rider', preferredName: rider.preferred_name || undefined,
    email: '', year: rider.year || '', major: rider.major || '',
    rating: 5.0, interests: rider.interests || [], clubs: rider.clubs || [],
    college: rider.college || '', musicTag: rider.music_tag || undefined,
    avatarUrl: rider.avatar_url || undefined,
  };

  const compatibility = (() => {
    if (!profile || !rider) return null;
    const a = dbProfileToFeatureProfile(profile as any);
    const b = dbProfileToFeatureProfile(rider as any);
    return computeMLCompatibilitySync(a, b, mlWeights);
  })();

  const handleAccept = async () => {
    setActing('accept');
    const { error } = await acceptRequest(request.id, trip.id);
    if (error) {
      toast.error('Failed to accept request');
    } else {
      // Add to trip_participants
      await supabase.from('trip_participants').insert({
        trip_id: trip.id,
        user_id: rider.id,
        role: 'rider',
      } as any);
      toast.success('Accepted — they\'re in! 🎉');
      onAction();
    }
    setActing(null);
  };

  const handleDeny = async () => {
    setActing('deny');
    const { error } = await denyRequest(request.id);
    if (error) {
      toast.error('Failed to deny request');
    } else {
      toast('Request denied');
      onAction();
    }
    setActing(null);
  };

  return (
    <>
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-start justify-between mb-3">
          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setShowProfile(true)}
          >
            <div className="w-10 h-10 rounded-full ucsd-gradient flex items-center justify-center text-primary-foreground text-sm font-bold overflow-hidden">
              {rider.avatar_url ? (
                <img src={rider.avatar_url} className="w-full h-full object-cover" alt="" />
              ) : (
                (rider.preferred_name || 'R').charAt(0)
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{rider.preferred_name || 'Rider'}</p>
              <p className="text-xs text-muted-foreground">{rider.year} · {rider.major} · {rider.college}</p>
            </div>
          </div>
          {!readonly && (
            <span className="chip chip-active text-xs animate-pulse">Pending</span>
          )}
          {readonly && request.status === 'accepted' && (
            <span className="badge-confirmed px-2.5 py-1 rounded-full text-xs font-medium">Accepted</span>
          )}
          {readonly && request.status === 'denied' && (
            <span className="badge-declined px-2.5 py-1 rounded-full text-xs font-medium">Denied</span>
          )}
        </div>

        {rider.interests && rider.interests.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {rider.interests.slice(0, 4).map(tag => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{tag}</span>
            ))}
          </div>
        )}

        {rider.clubs && rider.clubs.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {rider.clubs.slice(0, 3).map(club => (
              <span key={club} className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground">{club}</span>
            ))}
          </div>
        )}

        {compatibility && (
          <div className="mb-3">
            <CompatibilityBreakdown result={compatibility} showBreakdown />
          </div>
        )}

        {request.message && (
          <p className="text-xs text-muted-foreground italic mb-3">"{request.message}"</p>
        )}

        <div className="flex items-center gap-4 p-2.5 rounded-lg bg-muted/50 mb-3">
          <div className="flex items-center gap-1.5 text-xs">
            <MapPin className="w-3.5 h-3.5 text-primary/60" />
            <span className="font-medium text-foreground">{trip.to_location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Clock className="w-3.5 h-3.5 text-primary/60" />
            <span className="text-muted-foreground">{formatDepartureTime(trip.departure_time)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Users className="w-3.5 h-3.5 text-primary/60" />
            <span className="text-muted-foreground">{trip.seats_available}/{trip.seats_total} seats</span>
          </div>
        </div>

        {!readonly && (
          <div className="flex gap-2">
            <button
              onClick={handleDeny}
              disabled={acting !== null}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
            >
              {acting === 'deny' ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
              Not this time
            </button>
            <button
              onClick={handleAccept}
              disabled={acting !== null || trip.seats_available === 0}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-50"
            >
              {acting === 'accept' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Accept
            </button>
          </div>
        )}
      </div>

      <ProfileOverlay user={riderObj} open={showProfile} onClose={() => setShowProfile(false)} />
    </>
  );
};

export default DriverRequestsPage;
