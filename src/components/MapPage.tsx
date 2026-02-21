import { useStore } from '@/store/useStore';
import { DESTINATIONS } from '@/lib/mockData';
import { formatDepartureTime } from '@/lib/utils-drive';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Clock, DollarSign, Users, X } from 'lucide-react';
import FiltersBar from './FiltersBar';
import { toast } from 'sonner';

const MapPage = () => {
  const { getFilteredTrips, hoveredTripId, setHoveredTripId, setSelectedTripId, selectedTripId, getUserById, currentUser } = useStore();
  const trips = getFilteredTrips();

  // Normalize coordinates to viewport
  const allCoords = DESTINATIONS.map(d => d.coordinates);
  const minLat = Math.min(...allCoords.map(c => c.lat)) - 0.01;
  const maxLat = Math.max(...allCoords.map(c => c.lat)) + 0.01;
  const minLng = Math.min(...allCoords.map(c => c.lng)) - 0.01;
  const maxLng = Math.max(...allCoords.map(c => c.lng)) + 0.01;

  const toPos = (lat: number, lng: number) => ({
    x: ((lng - minLng) / (maxLng - minLng)) * 100,
    y: ((maxLat - lat) / (maxLat - minLat)) * 100,
  });

  // Group filtered trips by destination
  const destTrips = DESTINATIONS.map(d => ({
    ...d,
    trips: trips.filter(t => t.destination === d.name),
    pos: toPos(d.coordinates.lat, d.coordinates.lng),
  }));

  const selectedTrip = trips.find(t => t.id === selectedTripId);
  const selectedDriver = selectedTrip ? getUserById(selectedTrip.driverId) : null;

  // Generate stable fake road paths
  const roads = [
    'M 5,30 Q 25,28 50,35 T 95,32',
    'M 10,60 Q 30,55 55,62 T 92,58',
    'M 30,5 Q 32,30 28,55 T 35,95',
    'M 65,8 Q 62,25 68,50 T 60,92',
    'M 8,15 Q 45,20 80,18',
    'M 15,80 Q 50,75 85,82',
    'M 50,5 Q 48,50 52,95',
    'M 5,50 Q 50,48 95,52',
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <FiltersBar />
      <div className="relative w-full h-[calc(100vh-12rem)] bg-muted rounded-2xl overflow-hidden border border-border">
        {/* Map background with grid + roads */}
        <div className="absolute inset-0">
          <svg width="100%" height="100%" className="opacity-30">
            <defs>
              <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#mapGrid)" />
          </svg>
        </div>
        <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          {roads.map((d, i) => (
            <path key={i} d={d} fill="none" stroke="hsl(var(--foreground))" strokeWidth={i < 4 ? '0.6' : '0.3'} strokeLinecap="round" />
          ))}
        </svg>

        {/* Water area (fake bay) */}
        <div className="absolute bottom-0 left-0 right-0 h-[15%] bg-info/5 border-t border-info/10" />

        {/* Location label */}
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-card/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-border shadow-sm z-10">
          <Navigation className="w-4 h-4 text-primary" />
          <span className="text-sm font-display font-semibold text-foreground">San Diego, CA</span>
        </div>

        {/* Trip count */}
        <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-border shadow-sm z-10">
          <span className="text-xs font-medium text-muted-foreground">{trips.length} ride{trips.length !== 1 ? 's' : ''} available</span>
        </div>

        {/* Pins for each destination */}
        {destTrips.map((dest) => {
          if (dest.trips.length === 0) return null;
          const hasHovered = dest.trips.some(t => t.id === hoveredTripId);
          const hasSelected = dest.trips.some(t => t.id === selectedTripId);
          const isHighlighted = hasHovered || hasSelected;

          return (
            <motion.div
              key={dest.name}
              className="absolute z-20 -translate-x-1/2 -translate-y-full cursor-pointer group"
              style={{ left: `${dest.pos.x}%`, top: `${dest.pos.y}%` }}
              whileHover={{ scale: 1.15 }}
              onClick={() => {
                if (dest.trips.length > 0) {
                  setSelectedTripId(dest.trips[0].id);
                }
              }}
              onMouseEnter={() => {
                if (dest.trips.length > 0) setHoveredTripId(dest.trips[0].id);
              }}
              onMouseLeave={() => setHoveredTripId(null)}
            >
              <div className={`relative flex flex-col items-center transition-all duration-200 ${isHighlighted ? 'scale-110' : ''}`}>
                <div className={`px-2.5 py-1 rounded-lg text-xs font-semibold mb-1 whitespace-nowrap shadow-md transition-all duration-200 ${
                  isHighlighted
                    ? 'bg-secondary text-secondary-foreground scale-105'
                    : 'bg-card text-foreground border border-border'
                }`}>
                  {dest.name}
                  <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                    isHighlighted ? 'bg-secondary-foreground/20' : 'bg-primary/10 text-primary'
                  }`}>
                    {dest.trips.length}
                  </span>
                </div>
                <div className={`w-3 h-3 rounded-full border-2 transition-all duration-200 ${
                  isHighlighted
                    ? 'bg-secondary border-secondary-foreground/30 shadow-lg'
                    : 'bg-primary border-primary-foreground/30'
                }`}>
                  {isHighlighted && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-secondary/30"
                      animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Individual trip pins (offset slightly for multiple trips at same destination) */}
        {trips.map((trip, idx) => {
          const dest = DESTINATIONS.find(d => d.name === trip.destination);
          if (!dest) return null;
          const sameDestTrips = trips.filter(t => t.destination === trip.destination);
          const indexInDest = sameDestTrips.indexOf(trip);
          if (indexInDest === 0) return null; // first one is the destination pin
          const basePos = toPos(dest.coordinates.lat, dest.coordinates.lng);
          const offsetX = (indexInDest % 3) * 3 - 3;
          const offsetY = Math.floor(indexInDest / 3) * 4 + 4;

          const isSelected = selectedTripId === trip.id;
          const isHovered = hoveredTripId === trip.id;

          return (
            <motion.div
              key={trip.id}
              className="absolute z-[15] -translate-x-1/2 cursor-pointer"
              style={{ left: `${basePos.x + offsetX}%`, top: `${basePos.y + offsetY}%` }}
              whileHover={{ scale: 1.2 }}
              onClick={() => setSelectedTripId(trip.id)}
              onMouseEnter={() => setHoveredTripId(trip.id)}
              onMouseLeave={() => setHoveredTripId(null)}
            >
              <div className={`w-2.5 h-2.5 rounded-full border transition-all ${
                isSelected || isHovered
                  ? 'bg-secondary border-secondary-foreground/40 scale-125'
                  : 'bg-primary/60 border-primary/30'
              }`} />
            </motion.div>
          );
        })}

        {/* Selected trip detail panel */}
        <AnimatePresence>
          {selectedTrip && selectedDriver && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-card rounded-xl border border-border shadow-xl p-5 z-30"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full ucsd-gradient flex items-center justify-center text-primary-foreground text-sm font-bold">
                    {(selectedDriver.preferredName || selectedDriver.name).charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{selectedDriver.preferredName || selectedDriver.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedDriver.year} · {selectedDriver.major}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedTripId(null)} className="p-1.5 rounded-full hover:bg-muted transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="flex items-center gap-1.5 text-sm">
                  <MapPin className="w-4 h-4 text-primary/60" />
                  <span className="font-medium text-foreground">{selectedTrip.destination}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <Clock className="w-4 h-4 text-primary/60" />
                  <span className="text-muted-foreground">{formatDepartureTime(selectedTrip.departureTime)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <DollarSign className="w-4 h-4 text-primary/60" />
                  <span className="text-muted-foreground">${selectedTrip.compensationRate} suggested</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <Users className="w-4 h-4 text-primary/60" />
                  <span className="text-muted-foreground">{selectedTrip.seatsAvailable}/{selectedTrip.totalSeats} seats</span>
                </div>
              </div>

              {selectedTrip.notes && (
                <p className="text-xs text-muted-foreground italic mb-3">"{selectedTrip.notes}"</p>
              )}

              <button
                onClick={() => {
                  toast.success('Ride requested! (demo)', { description: `${selectedTrip.destination} with ${selectedDriver.preferredName || selectedDriver.name}` });
                }}
                disabled={selectedTrip.seatsAvailable === 0}
                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {selectedTrip.seatsAvailable > 0 ? 'Request Ride' : 'No Seats Available'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MapPage;
