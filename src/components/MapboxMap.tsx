import { useEffect, useRef, useState, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { formatDepartureTime, computeCompatibility } from '@/lib/utils-drive';
import { useAuth } from '@/contexts/AuthContext';
import { MapPin, Clock, DollarSign, Users, X, Sparkles, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// ── UCSD college approximate polygons (lng/lat) ──
const COLLEGE_REGIONS: { name: string; color: string; coords: [number, number][] }[] = [
  { name: 'Revelle', color: 'rgba(59,130,246,0.15)', coords: [[-117.2430,32.8730],[-117.2380,32.8730],[-117.2380,32.8755],[-117.2430,32.8755]] },
  { name: 'Muir', color: 'rgba(16,185,129,0.15)', coords: [[-117.2425,32.8770],[-117.2380,32.8770],[-117.2380,32.8795],[-117.2425,32.8795]] },
  { name: 'Marshall', color: 'rgba(245,158,11,0.15)', coords: [[-117.2395,32.8840],[-117.2350,32.8840],[-117.2350,32.8865],[-117.2395,32.8865]] },
  { name: 'Warren', color: 'rgba(239,68,68,0.15)', coords: [[-117.2350,32.8810],[-117.2300,32.8810],[-117.2300,32.8835],[-117.2350,32.8835]] },
  { name: 'ERC', color: 'rgba(168,85,247,0.15)', coords: [[-117.2440,32.8855],[-117.2400,32.8855],[-117.2400,32.8880],[-117.2440,32.8880]] },
  { name: 'Sixth', color: 'rgba(236,72,153,0.15)', coords: [[-117.2440,32.8830],[-117.2400,32.8830],[-117.2400,32.8855],[-117.2440,32.8855]] },
  { name: 'Seventh', color: 'rgba(20,184,166,0.15)', coords: [[-117.2460,32.8815],[-117.2440,32.8815],[-117.2440,32.8845],[-117.2460,32.8845]] },
];

const COLLEGE_CENTERS: Record<string, [number, number]> = {
  Revelle: [-117.2405, 32.8742],
  Muir: [-117.2402, 32.8782],
  Marshall: [-117.2372, 32.8852],
  Warren: [-117.2325, 32.8822],
  ERC: [-117.2420, 32.8867],
  Sixth: [-117.2420, 32.8842],
  Seventh: [-117.2450, 32.8830],
};

const DEST_COORDS: Record<string, [number, number]> = {
  'Pacific Beach': [-117.2536, 32.7937],
  'Downtown': [-117.1611, 32.7157],
  'Grocery': [-117.2100, 32.8600],
  'Airport': [-117.1933, 32.7338],
  'UCSD': [-117.2340, 32.8801],
};

// ── Mock trips fallback — uses shared data ──
import { MOCK_DB_TRIPS } from '@/lib/mockTripsData';
const MOCK_TRIPS: MapTrip[] = MOCK_DB_TRIPS.map(t => ({
  id: t.id,
  to_location: t.to_location,
  departure_time: t.departure_time,
  seats_available: t.seats_available,
  seats_total: t.seats_total,
  comp_rate: t.comp_rate,
  notes: t.notes,
  coordinates: t.coordinates,
  driver_id: t.driver_id,
  driver: t.driver ? {
    preferred_name: t.driver.preferred_name,
    college: t.driver.college,
    year: t.driver.year,
    major: t.driver.major,
    interests: t.driver.interests,
    clubs: t.driver.clubs,
    music_tag: t.driver.music_tag,
  } : undefined,
}));

export interface MapTrip {
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
    interests?: string[];
    clubs?: string[];
    music_tag?: string | null;
  };
}

interface Props {
  trips: MapTrip[];
}

function getTripCoords(trip: MapTrip): [number, number] {
  if (trip.coordinates?.lng && trip.coordinates?.lat) return [trip.coordinates.lng, trip.coordinates.lat];
  // Place pin near driver's college if known, otherwise near destination
  const college = trip.driver?.college;
  if (college && COLLEGE_CENTERS[college]) {
    const [lng, lat] = COLLEGE_CENTERS[college];
    const hash = trip.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return [lng + (hash % 11 - 5) * 0.0003, lat + (hash % 7 - 3) * 0.0002];
  }
  if (DEST_COORDS[trip.to_location]) return DEST_COORDS[trip.to_location];
  const hash = trip.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return [-117.2340 + (hash % 20 - 10) * 0.001, 32.8801 + (hash % 15 - 7) * 0.001];
}

const MapboxMap = ({ trips: externalTrips }: Props) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<MapTrip | null>(null);
  const { profile } = useAuth();

  const token = 'pk.eyJ1IjoiZGhydXYxNGsiLCJhIjoiY21sd3l3bmN0MG4xeDNlcHB2M2ZseXNjciJ9.6IvuBUbVJQm25b83oPIAtw';

  // Use external trips if available, otherwise mock
  const trips = useMemo(() => externalTrips.length > 0 ? externalTrips : MOCK_TRIPS, [externalTrips]);

  // Compatibility for selected trip
  const compatibility = useMemo(() => {
    if (!selectedTrip?.driver || !profile) return null;
    const me = {
      id: profile.id, name: profile.email, email: profile.email,
      year: profile.year || '', major: profile.major || '', rating: 5,
      interests: profile.interests || [], clubs: profile.clubs || [],
      college: profile.college || '', musicTag: profile.music_tag || undefined,
    };
    const them = {
      id: selectedTrip.driver_id, name: selectedTrip.driver.preferred_name || '', email: '',
      year: selectedTrip.driver.year || '', major: selectedTrip.driver.major || '', rating: 5,
      interests: selectedTrip.driver.interests || [], clubs: selectedTrip.driver.clubs || [],
      college: selectedTrip.driver.college || '', musicTag: selectedTrip.driver.music_tag || undefined,
    };
    return computeCompatibility(me, them);
  }, [selectedTrip, profile]);

  // Init map
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

    // Add college overlays once map loads
    map.current.on('load', () => {
      COLLEGE_REGIONS.forEach((region, i) => {
        const srcId = `college-${i}`;
        map.current!.addSource(srcId, {
          type: 'geojson',
          data: { type: 'Feature', properties: { name: region.name }, geometry: { type: 'Polygon', coordinates: [[...region.coords, region.coords[0]]] } },
        });
        map.current!.addLayer({ id: `${srcId}-fill`, type: 'fill', source: srcId, paint: { 'fill-color': region.color.replace('0.15', '0.18'), 'fill-outline-color': region.color.replace('0.15', '0.5') } });
        map.current!.addLayer({ id: `${srcId}-line`, type: 'line', source: srcId, paint: { 'line-color': region.color.replace('0.15', '0.5'), 'line-width': 1.5 } });
      });
      // College labels
      const labelFeatures = Object.entries(COLLEGE_CENTERS).map(([name, [lng, lat]]) => ({
        type: 'Feature' as const, properties: { name }, geometry: { type: 'Point' as const, coordinates: [lng, lat] },
      }));
      map.current!.addSource('college-labels', { type: 'geojson', data: { type: 'FeatureCollection', features: labelFeatures } });
      map.current!.addLayer({
        id: 'college-labels-layer', type: 'symbol', source: 'college-labels',
        layout: { 'text-field': ['get', 'name'], 'text-size': 12, 'text-font': ['DIN Pro Bold', 'Arial Unicode MS Bold'], 'text-anchor': 'center' },
        paint: { 'text-color': '#334155', 'text-halo-color': '#ffffff', 'text-halo-width': 1.5 },
      });
    });

    return () => { map.current?.remove(); map.current = null; };
  }, [token]);

  // Markers
  useEffect(() => {
    if (!map.current) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    trips.forEach(trip => {
      const coords = getTripCoords(trip);
      const el = document.createElement('div');
      el.style.cssText = 'cursor:pointer;';
      el.innerHTML = `<div style="background:hsl(213 70% 22%);color:white;padding:5px 10px;border-radius:10px;font-size:11px;font-weight:600;white-space:nowrap;box-shadow:0 2px 10px rgba(0,0,0,0.2);border:2px solid rgba(255,255,255,0.3);">${trip.to_location}<span style="opacity:0.7;margin-left:4px;font-weight:400;">${trip.seats_available} seats</span></div>`;
      el.addEventListener('click', () => {
        setSelectedTrip(trip);
        map.current?.flyTo({ center: coords, zoom: 15, duration: 800 });
      });
      markersRef.current.push(new mapboxgl.Marker({ element: el }).setLngLat(coords).addTo(map.current!));
    });
  }, [trips]);

  if (!token) {
    return (
      <div className="w-full h-full min-h-[500px] bg-muted rounded-2xl flex flex-col items-center justify-center border border-border gap-3">
        <AlertTriangle className="w-8 h-8 text-warning" />
        <p className="text-foreground font-semibold text-sm">Missing Mapbox token</p>
        <p className="text-muted-foreground text-xs">Set <code className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">VITE_MAPBOX_ACCESS_TOKEN</code> in your environment</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-2xl overflow-hidden border border-border">
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Badges */}
      <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-border shadow-sm z-10">
        <span className="text-xs font-medium text-muted-foreground">{trips.length} ride{trips.length !== 1 ? 's' : ''} available</span>
      </div>

      {/* Selected trip panel + compatibility */}
      <AnimatePresence>
        {selectedTrip && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-[400px] bg-card rounded-xl border border-border shadow-xl p-5 z-30"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full ucsd-gradient flex items-center justify-center text-primary-foreground text-sm font-bold">
                  {(selectedTrip.driver?.preferred_name || 'D').charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{selectedTrip.driver?.preferred_name || 'Driver'}</p>
                  <p className="text-xs text-muted-foreground">{selectedTrip.driver?.college} · {selectedTrip.driver?.year} · {selectedTrip.driver?.major}</p>
                </div>
              </div>
              <button onClick={() => setSelectedTrip(null)} className="p-1.5 rounded-full hover:bg-muted transition-colors"><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="flex items-center gap-1.5 text-sm"><MapPin className="w-4 h-4 text-primary/60" /><span className="font-medium text-foreground">{selectedTrip.to_location}</span></div>
              <div className="flex items-center gap-1.5 text-sm"><Clock className="w-4 h-4 text-primary/60" /><span className="text-muted-foreground">{formatDepartureTime(selectedTrip.departure_time)}</span></div>
              <div className="flex items-center gap-1.5 text-sm"><DollarSign className="w-4 h-4 text-primary/60" /><span className="text-muted-foreground">${selectedTrip.comp_rate} suggested</span></div>
              <div className="flex items-center gap-1.5 text-sm"><Users className="w-4 h-4 text-primary/60" /><span className="text-muted-foreground">{selectedTrip.seats_available}/{selectedTrip.seats_total} seats</span></div>
            </div>

            {selectedTrip.notes && <p className="text-xs text-muted-foreground italic mb-3">"{selectedTrip.notes}"</p>}

            {/* Compatibility score */}
            {compatibility && (
              <div className="p-3 rounded-lg bg-secondary/10 border border-secondary/20 mb-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <Sparkles className="w-4 h-4 text-secondary" />
                  <span className="text-sm font-bold text-secondary">{compatibility.score}% match</span>
                </div>
                {compatibility.reasons.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {compatibility.reasons.map((r, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{r}</span>
                    ))}
                  </div>
                )}
                {compatibility.reasons.length === 0 && <p className="text-xs text-muted-foreground">No shared traits yet — sign up to see yours!</p>}
              </div>
            )}

            <button
              onClick={() => toast.success('Ride requested! 🎉', { description: selectedTrip.to_location })}
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
