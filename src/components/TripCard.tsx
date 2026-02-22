import { Trip, RideRequest } from '@/types';
import { useStore } from '@/store/useStore';
import { formatDepartureTime } from '@/lib/utils-drive';
import { computeCompatibility, CompatibilityResult, CompatibilityProfile } from '@/lib/compatibility';
import CompatibilityBreakdown from './CompatibilityBreakdown';
import ProfileOverlay from './ProfileOverlay';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, DollarSign, Users, Star, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useState } from 'react';

interface Props {
  trip: Trip;
}

const TripCard = ({ trip }: Props) => {
  const { currentUser, role, getUserById, getRequestsForTrip, hoveredTripId, setHoveredTripId, setSelectedTripId } = useStore();
  const driver = getUserById(trip.driverId);
  const requests = getRequestsForTrip(trip.id);
  const myRequest = currentUser ? requests.find(r => r.riderId === currentUser.id) : null;
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const isHovered = hoveredTripId === trip.id;

  const [showConfirm, setShowConfirm] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const compatibility = currentUser && driver ? computeCompatibility(currentUser, driver) : null;

  const handleRequestSeat = () => {
    if (!currentUser) return;
    setShowConfirm(true);
  };

  const confirmRequest = () => {
    if (!currentUser) return;
    api.requestSeat(trip.id, currentUser.id);
    setShowConfirm(false);
    toast.success('Seat requested! 🎉', { description: 'The driver will review your request.' });
  };

  const handleAccept = (reqId: string) => {
    if (!currentUser) return;
    api.acceptRequest(reqId, currentUser.id);
    toast.success('Request accepted! ✅');
  };

  const handleDecline = (reqId: string) => {
    if (!currentUser) return;
    api.declineRequest(reqId, currentUser.id);
    toast('Request declined');
  };

  if (!driver) return null;

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={`card-hover bg-card rounded-xl border p-5 cursor-pointer ${
          isHovered ? 'ring-2 ring-secondary shadow-lg' : 'border-border'
        }`}
        onMouseEnter={() => setHoveredTripId(trip.id)}
        onMouseLeave={() => setHoveredTripId(null)}
        onClick={() => setSelectedTripId(trip.id)}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={(e) => { e.stopPropagation(); setShowProfile(true); }}
          >
            <div className="w-8 h-8 rounded-full ucsd-gradient flex items-center justify-center text-primary-foreground text-sm font-bold">
              {(driver.preferredName || driver.name).charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{driver.preferredName || driver.name}</p>
              <p className="text-xs text-muted-foreground">{driver.year} · {driver.major}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-secondary">
            <Star className="w-3.5 h-3.5 fill-secondary" />
            <span className="font-semibold">{driver.rating}</span>
          </div>
        </div>

        {/* Interest tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {driver.interests.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>

        {/* Trip info */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex items-center gap-1.5 text-sm">
            <MapPin className="w-4 h-4 text-primary/60" />
            <span className="font-medium text-foreground">{trip.destination}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <Clock className="w-4 h-4 text-primary/60" />
            <span className="text-muted-foreground">{formatDepartureTime(trip.departureTime)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <DollarSign className="w-4 h-4 text-primary/60" />
            <span className="text-muted-foreground">${trip.compensationRate} suggested</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <Users className="w-4 h-4 text-primary/60" />
            <AnimatePresence mode="popLayout">
              <motion.span
                key={trip.seatsAvailable}
                initial={{ scale: 1.4, color: 'hsl(44 95% 55%)' }}
                animate={{ scale: 1, color: 'hsl(var(--muted-foreground))' }}
                className="font-semibold"
              >
                {trip.seatsAvailable}
              </motion.span>
            </AnimatePresence>
            <span className="text-muted-foreground">/ {trip.totalSeats} seats</span>
          </div>
        </div>

        {/* Notes */}
        {trip.notes && (
          <p className="text-xs text-muted-foreground italic mb-3">"{trip.notes}"</p>
        )}

        {/* Compatibility */}
        {compatibility && role === 'rider' && (
          <div className="mb-3">
            <CompatibilityBreakdown result={compatibility} />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {role === 'rider' && (
            <>
              {myRequest ? (
                <StatusBadge status={myRequest.status} onPayClick={() => setShowPayment(true)} />
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); handleRequestSeat(); }}
                  disabled={trip.seatsAvailable === 0}
                  className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {trip.seatsAvailable > 0 ? 'Request Seat' : 'Full'}
                </button>
              )}
            </>
          )}

          {role === 'driver' && currentUser?.id === trip.driverId && (
            <div className="w-full">
              {pendingCount > 0 && (
                <div className="flex items-center gap-1 mb-2">
                  <span className="chip chip-active text-xs animate-pulse-gold">{pendingCount} pending</span>
                </div>
              )}
              {requests.filter(r => r.status === 'pending').map((req) => {
                const rider = getUserById(req.riderId);
                return (
                  <div key={req.id} className="flex items-center justify-between p-2 rounded-lg bg-muted mb-1">
                    <span className="text-sm font-medium text-foreground">{rider?.name || 'Rider'}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAccept(req.id); }}
                        className="p-1.5 rounded-md bg-success/15 text-success hover:bg-success/25 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDecline(req.id); }}
                        className="p-1.5 rounded-md bg-destructive/15 text-destructive hover:bg-destructive/25 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>

      {/* Confirm Request Modal */}
      <AnimatePresence>
        {showConfirm && (
          <ModalOverlay onClose={() => setShowConfirm(false)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card rounded-2xl p-6 w-full max-w-sm shadow-xl border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-display text-lg font-bold text-foreground mb-2">Confirm Seat Request</h3>
              <p className="text-sm text-muted-foreground mb-1">
                Trip to <strong>{trip.destination}</strong> with {driver.name}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Suggested: <strong>${trip.compensationRate}</strong>
              </p>
              <div className="flex gap-2">
                <button onClick={() => setShowConfirm(false)} className="flex-1 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
                  Cancel
                </button>
                <button onClick={confirmRequest} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all">
                  Confirm
                </button>
              </div>
            </motion.div>
          </ModalOverlay>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPayment && (
          <ModalOverlay onClose={() => setShowPayment(false)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card rounded-2xl p-6 w-full max-w-sm shadow-xl border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-display text-lg font-bold text-foreground mb-2">Pay Driver</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Send <strong>${trip.compensationRate}</strong> to {driver.name}
              </p>
              <div className="flex flex-col gap-2">
                {['Venmo', 'Zelle', 'Stripe'].map((method) => (
                  <button
                    key={method}
                    onClick={() => { toast.info(`${method} (demo only)`); setShowPayment(false); }}
                    className="w-full py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    Pay with {method}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowPayment(false)} className="w-full mt-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                Close
              </button>
            </motion.div>
          </ModalOverlay>
        )}
      </AnimatePresence>

      {/* Profile Overlay */}
      {driver && (
        <ProfileOverlay user={driver} open={showProfile} onClose={() => setShowProfile(false)} />
      )}
    </>
  );
};

const StatusBadge = ({ status, onPayClick }: { status: string; onPayClick: () => void }) => {
  if (status === 'pending') {
    return (
      <div className="flex items-center gap-2 badge-pending px-3 py-2 rounded-lg text-sm font-medium w-full justify-center">
        <Loader2 className="w-4 h-4 animate-spin" />
        Pending
      </div>
    );
  }
  if (status === 'confirmed') {
    return (
      <div className="flex items-center gap-2 w-full">
        <span className="badge-confirmed px-3 py-2 rounded-lg text-sm font-medium flex-1 text-center">
          ✅ Confirmed
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onPayClick(); }}
          className="px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-semibold hover:brightness-110 transition-all"
        >
          Pay
        </button>
      </div>
    );
  }
  return (
    <div className="badge-declined px-3 py-2 rounded-lg text-sm font-medium w-full text-center">
      Declined
    </div>
  );
};

const ModalOverlay = ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4"
    onClick={onClose}
  >
    {children}
  </motion.div>
);

export default TripCard;
