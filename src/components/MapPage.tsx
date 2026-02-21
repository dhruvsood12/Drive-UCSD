import { useStore } from '@/store/useStore';
import { DESTINATIONS } from '@/lib/mockData';
import { formatDepartureTime } from '@/lib/utils-drive';
import { motion } from 'framer-motion';
import { MapPin, Navigation } from 'lucide-react';

// Simulated map with styled pins — no Mapbox dependency needed for MVP
const MapPage = () => {
  const { trips, hoveredTripId, setHoveredTripId, setSelectedTripId, selectedTripId, getUserById } = useStore();

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

  // Group trips by destination for pin counts
  const destTrips = DESTINATIONS.map(d => ({
    ...d,
    trips: trips.filter(t => t.destination === d.name),
    pos: toPos(d.coordinates.lat, d.coordinates.lng),
  }));

  const selectedTrip = trips.find(t => t.id === selectedTripId);
  const selectedDriver = selectedTrip ? getUserById(selectedTrip.driverId) : null;

  return (
    <div className="relative w-full h-[calc(100vh-10rem)] bg-muted rounded-2xl overflow-hidden border border-border">
      {/* Simulated map background */}
      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--border))" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* UCSD label */}
      <div className="absolute top-4 left-4 flex items-center gap-2 bg-card/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-border shadow-sm z-10">
        <Navigation className="w-4 h-4 text-primary" />
        <span className="text-sm font-display font-semibold text-foreground">San Diego, CA</span>
      </div>

      {/* Pins */}
      {destTrips.map((dest) => {
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
            {/* Pin */}
            <div className={`relative flex flex-col items-center transition-all duration-200 ${isHighlighted ? 'scale-110' : ''}`}>
              <div className={`px-2.5 py-1 rounded-lg text-xs font-semibold mb-1 whitespace-nowrap shadow-md transition-all duration-200 ${
                isHighlighted
                  ? 'bg-secondary text-secondary-foreground scale-105'
                  : 'bg-card text-foreground border border-border'
              }`}>
                {dest.name}
                {dest.trips.length > 0 && (
                  <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                    isHighlighted ? 'bg-secondary-foreground/20' : 'bg-primary/10 text-primary'
                  }`}>
                    {dest.trips.length}
                  </span>
                )}
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

      {/* Selected trip detail */}
      {selectedTrip && selectedDriver && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-card rounded-xl border border-border shadow-xl p-4 z-30"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full ucsd-gradient flex items-center justify-center text-primary-foreground text-sm font-bold">
                {selectedDriver.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{selectedDriver.name}</p>
                <p className="text-xs text-muted-foreground">{selectedDriver.year} · {selectedDriver.major}</p>
              </div>
            </div>
            <button onClick={() => setSelectedTripId(null)} className="text-muted-foreground hover:text-foreground text-lg">×</button>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {selectedTrip.destination}</span>
            <span>{formatDepartureTime(selectedTrip.departureTime)}</span>
            <span>{selectedTrip.seatsAvailable} seats</span>
          </div>
          {selectedTrip.notes && (
            <p className="text-xs text-muted-foreground italic mt-2">"{selectedTrip.notes}"</p>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default MapPage;
