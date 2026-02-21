import { useStore } from '@/store/useStore';
import { CAMPUS_REGIONS, CAMPUS_ROADS, tripToCampusPos } from '@/lib/campusMap';
import { formatDepartureTime } from '@/lib/utils-drive';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Clock, DollarSign, Users, X } from 'lucide-react';
import FiltersBar from './FiltersBar';
import { toast } from 'sonner';

const MapPage = () => {
  const { getFilteredTrips, hoveredTripId, setHoveredTripId, setSelectedTripId, selectedTripId, getUserById } = useStore();
  const trips = getFilteredTrips();

  const selectedTrip = trips.find(t => t.id === selectedTripId);
  const selectedDriver = selectedTrip ? getUserById(selectedTrip.driverId) : null;

  // Build pin data: place each trip inside driver's college region
  const pins = trips.map(trip => {
    const driver = getUserById(trip.driverId);
    const college = driver?.college || 'Price Center';
    const pos = tripToCampusPos(trip.id, college);
    return { trip, driver, pos };
  });

  return (
    <div className="max-w-5xl mx-auto">
      <FiltersBar />
      <div className="relative w-full h-[calc(100vh-12rem)] bg-muted rounded-2xl overflow-hidden border border-border">
        {/* SVG Campus Map */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 w-full h-full"
        >
          {/* Terrain background */}
          <defs>
            <pattern id="campusGrid" width="5" height="5" patternUnits="userSpaceOnUse">
              <path d="M 5 0 L 0 0 0 5" fill="none" stroke="hsl(var(--border))" strokeWidth="0.08" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="hsl(var(--background))" />
          <rect width="100" height="100" fill="url(#campusGrid)" />

          {/* Ocean / canyon area at bottom-right */}
          <path d="M 85,70 Q 95,65 100,72 L 100,100 L 75,100 Q 80,85 85,70" fill="hsl(206 90% 54% / 0.08)" />

          {/* Roads */}
          {CAMPUS_ROADS.map((d, i) => (
            <path key={i} d={d} fill="none" stroke="hsl(var(--foreground) / 0.12)" strokeWidth="0.6" strokeLinecap="round" strokeDasharray={i > 5 ? '1,1' : 'none'} />
          ))}

          {/* Region polygons */}
          {CAMPUS_REGIONS.map(region => (
            <g key={region.id}>
              <polygon
                points={region.polygon}
                fill={region.fill}
                stroke="hsl(var(--foreground) / 0.15)"
                strokeWidth="0.3"
                opacity="0.7"
              />
              <text
                x={region.cx}
                y={region.cy}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="2.2"
                fontWeight="600"
                fill="hsl(var(--foreground) / 0.55)"
                fontFamily="'Space Grotesk', sans-serif"
              >
                {region.label}
              </text>
            </g>
          ))}

          {/* Road labels */}
          <text x="50" y="11" textAnchor="middle" fontSize="1.4" fill="hsl(var(--muted-foreground) / 0.4)" fontStyle="italic">La Jolla Village Dr</text>
          <text x="50" y="28" textAnchor="middle" fontSize="1.4" fill="hsl(var(--muted-foreground) / 0.4)" fontStyle="italic">Gilman Dr</text>
          <text x="14" y="78" textAnchor="middle" fontSize="1.4" fill="hsl(var(--muted-foreground) / 0.4)" fontStyle="italic" transform="rotate(-80,14,78)">N Torrey Pines</text>
        </svg>

        {/* Location label */}
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-card/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-border shadow-sm z-10">
          <Navigation className="w-4 h-4 text-primary" />
          <span className="text-sm font-display font-semibold text-foreground">UC San Diego Campus</span>
        </div>

        {/* Trip count */}
        <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-border shadow-sm z-10">
          <span className="text-xs font-medium text-muted-foreground">{trips.length} ride{trips.length !== 1 ? 's' : ''} available</span>
        </div>

        {/* Pins */}
        {pins.map(({ trip, driver, pos }) => {
          const isSelected = selectedTripId === trip.id;
          const isHovered = hoveredTripId === trip.id;
          const highlighted = isSelected || isHovered;

          return (
            <motion.div
              key={trip.id}
              className="absolute z-20 -translate-x-1/2 -translate-y-full cursor-pointer"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              whileHover={{ scale: 1.2 }}
              onClick={() => setSelectedTripId(trip.id)}
              onMouseEnter={() => setHoveredTripId(trip.id)}
              onMouseLeave={() => setHoveredTripId(null)}
            >
              <div className="flex flex-col items-center">
                <div className={`px-2 py-0.5 rounded-md text-[10px] font-semibold mb-0.5 whitespace-nowrap shadow-sm transition-all ${
                  highlighted
                    ? 'bg-secondary text-secondary-foreground scale-105'
                    : 'bg-card text-foreground border border-border'
                }`}>
                  {trip.destination}
                </div>
                <div className={`w-2.5 h-2.5 rounded-full border-2 transition-all ${
                  highlighted
                    ? 'bg-secondary border-secondary-foreground/30 shadow-lg'
                    : 'bg-primary border-primary-foreground/30'
                }`} />
                {highlighted && (
                  <motion.div
                    className="absolute bottom-0 w-2.5 h-2.5 rounded-full bg-secondary/30"
                    animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </div>
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
                    <p className="text-xs text-muted-foreground">{selectedDriver.college} · {selectedDriver.year} · {selectedDriver.major}</p>
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
