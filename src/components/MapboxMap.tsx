import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { formatDepartureTime } from '@/lib/utils-drive';
import { MapPin, Clock, DollarSign, Users, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// UCSD landmarks for geocoding common destinations
const UCSD_LANDMARKS: Record<string, [number, number]> = {
  'Geisel Library': [-117.2372, 32.8811],
  'Price Center': [-117.2370, 32.8796],
  'Warren College': [-117.2328, 32.8820],
  'Sixth College': [-117.2415, 32.8845],
  'ERC': [-117.2415, 32.8865],
  'Revelle': [-117.2405, 32.8740],
  'Muir': [-117.2400, 32.8780],
  'Marshall': [-117.2370, 32.8850],
  'Seventh': [-117.2430, 32.8830],
  'RIMAC': [-117.2420, 32.8875],
};

const DEST_COORDS: Record<string, [number, number]> = {
  'Pacific Beach': [-117.2536, 32.7937],
  'Downtown': [-117.1611, 32.7157],
  'Grocery': [-117.2100, 32.8600],
  'Airport': [-117.1933, 32.7338],
  'UCSD': [-117.2340, 32.8801],
};

interface Trip {
  id: string;
  to_location: string;
  departure_time: string;
  seats_available: number;
  seats_total: number;
  comp_rate: number;
  notes: string;
  coordinates: any;
  driver_id: string;
  driver?: {
    preferred_name: string | null;
    college: string | null;
    year: string | null;
    major: string | null;
  };
}

interface Props {
  trips: Trip[];
}

const MapboxMap = ({ trips }: Props) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  const token = import.meta.env.VITE_MAPBOX_TOKEN;

  useEffect(() => {
    if (!mapContainer.current || !token || map.current) return;

    mapboxgl.accessToken = token;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-117.2340, 32.8801],
      zoom: 14,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-left');

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [token]);

  // Update markers when trips change
  useEffect(() => {
    if (!map.current) return;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    trips.forEach(trip => {
      let coords: [number, number];

      // Try trip coordinates, then destination lookup, then fallback
      if (trip.coordinates?.lng && trip.coordinates?.lat) {
        coords = [trip.coordinates.lng, trip.coordinates.lat];
      } else if (DEST_COORDS[trip.to_location]) {
        coords = DEST_COORDS[trip.to_location];
      } else {
        // Stable jitter from trip id
        const hash = trip.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
        coords = [-117.2340 + (hash % 20 - 10) * 0.001, 32.8801 + (hash % 15 - 7) * 0.001];
      }

      const el = document.createElement('div');
      el.className = 'mapbox-pin';
      el.innerHTML = `<div style="background:hsl(213 70% 22%);color:white;padding:4px 8px;border-radius:8px;font-size:11px;font-weight:600;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.15);cursor:pointer;">${trip.to_location}</div>`;
      el.addEventListener('click', () => setSelectedTrip(trip));

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(coords)
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [trips]);

  if (!token) {
    return (
      <div className="w-full h-[calc(100vh-12rem)] bg-muted rounded-2xl flex items-center justify-center border border-border">
        <p className="text-muted-foreground text-sm">Mapbox token not configured</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[calc(100vh-12rem)] rounded-2xl overflow-hidden border border-border">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Trip count badge */}
      <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-border shadow-sm z-10">
        <span className="text-xs font-medium text-muted-foreground">
          {trips.length} ride{trips.length !== 1 ? 's' : ''} available
        </span>
      </div>

      {/* Selected trip panel */}
      <AnimatePresence>
        {selectedTrip && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-card rounded-xl border border-border shadow-xl p-5 z-30"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full ucsd-gradient flex items-center justify-center text-primary-foreground text-sm font-bold">
                  {(selectedTrip.driver?.preferred_name || 'D').charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{selectedTrip.driver?.preferred_name || 'Driver'}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedTrip.driver?.college} · {selectedTrip.driver?.year} · {selectedTrip.driver?.major}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedTrip(null)} className="p-1.5 rounded-full hover:bg-muted transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="flex items-center gap-1.5 text-sm">
                <MapPin className="w-4 h-4 text-primary/60" />
                <span className="font-medium text-foreground">{selectedTrip.to_location}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <Clock className="w-4 h-4 text-primary/60" />
                <span className="text-muted-foreground">{formatDepartureTime(selectedTrip.departure_time)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <DollarSign className="w-4 h-4 text-primary/60" />
                <span className="text-muted-foreground">${selectedTrip.comp_rate} suggested</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <Users className="w-4 h-4 text-primary/60" />
                <span className="text-muted-foreground">{selectedTrip.seats_available}/{selectedTrip.seats_total} seats</span>
              </div>
            </div>

            {selectedTrip.notes && (
              <p className="text-xs text-muted-foreground italic mb-3">"{selectedTrip.notes}"</p>
            )}

            <button
              onClick={() => toast.success('Ride requested! (demo)', { description: selectedTrip.to_location })}
              disabled={selectedTrip.seats_available === 0}
              className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {selectedTrip.seats_available > 0 ? 'Request Ride' : 'No Seats Available'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MapboxMap;
