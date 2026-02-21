import { useStore } from '@/store/useStore';
import FiltersBar from './FiltersBar';
import TripCard from './TripCard';
import { motion } from 'framer-motion';

const FeedPage = () => {
  const { getFilteredTrips } = useStore();
  const trips = getFilteredTrips();

  return (
    <div className="max-w-2xl mx-auto">
      <FiltersBar />
      
      {trips.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg font-display font-semibold text-muted-foreground">No trips found</p>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {trips.map((trip, i) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <TripCard trip={trip} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedPage;
