import { useMyRequests } from '@/hooks/useRideRequests';
import { formatDepartureTime } from '@/lib/utils-drive';
import { motion } from 'framer-motion';
import { MapPin, Clock, Loader2, CheckCircle, XCircle, Inbox } from 'lucide-react';

const MyRequestsSection = () => {
  const { requests, loading } = useMyRequests();

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <Inbox className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
        <p className="text-sm font-medium text-muted-foreground">No trip requests yet</p>
        <p className="text-xs text-muted-foreground mt-0.5">Request to join a trip from the feed!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {requests.map((req, i) => {
        const trip = req.trip;
        if (!trip) return null;

        return (
          <motion.div
            key={req.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center justify-between p-3 rounded-lg bg-card border border-border"
          >
            <div className="flex items-center gap-3">
              <StatusIcon status={req.status} />
              <div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-primary/60" />
                  <span className="text-sm font-medium text-foreground">{trip.to_location}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground/60" />
                  <span className="text-xs text-muted-foreground">{formatDepartureTime(trip.departure_time)}</span>
                </div>
              </div>
            </div>
            <StatusLabel status={req.status} />
          </motion.div>
        );
      })}
    </div>
  );
};

const StatusIcon = ({ status }: { status: string }) => {
  if (status === 'pending') return <Loader2 className="w-5 h-5 text-warning animate-spin" />;
  if (status === 'accepted') return <CheckCircle className="w-5 h-5 text-success" />;
  return <XCircle className="w-5 h-5 text-destructive" />;
};

const StatusLabel = ({ status }: { status: string }) => {
  if (status === 'pending') return <span className="badge-pending px-2.5 py-1 rounded-full text-xs font-medium">Pending</span>;
  if (status === 'accepted') return <span className="badge-confirmed px-2.5 py-1 rounded-full text-xs font-medium">You're in! 🎉</span>;
  return <span className="badge-declined px-2.5 py-1 rounded-full text-xs font-medium">Not this time</span>;
};

export default MyRequestsSection;
