import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { formatDepartureTime } from '@/lib/utils-drive';
import { useAuth } from '@/contexts/AuthContext';
import { requestSeat, getMyRequestForTrip } from '@/hooks/useRideRequests';
import { dbProfileToFeatureProfile, computeMLCompatibilitySync } from '@/ml';
import { useMLWeights } from '@/hooks/useMLCompatibility';
import { DESTINATIONS } from '@/lib/destinations';
import { MapPin, Clock, DollarSign, Users, X, Sparkles, Search, Navigation, Flame, ArrowUpRight, ArrowDownLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const COLLEGE_CENTERS: Record<string, [number, number]> = {
  Revelle: [-117.2405, 32.8742],
  Muir: [-117.2402, 32.8782],
  Marshall: [-117.2372, 32.8852],
  Warren: [-117.2325, 32.8822],
  ERC: [-117.2420, 32.8867],
  Sixth: [-117.2420, 32.8842],
  Seventh: [-117.2450, 32.8830],
};

const UCSD_CENTER: [number, number] = [-117.2340, 32.8801];

const DEST_COORDS: Record<string, [number, number]> = {};
DESTINATIONS.forEach(d => { DEST_COORDS[d.name] = [d.coords[0], d.coords[1]]; });
DEST_COORDS['UCSD'] = UCSD_CENTER;
DEST_COORDS['Grocery'] = [-117.2100, 32.8600];

export interface MapTrip {
  id: string;
  to_location: string;
  from_location?: string;
  departure_time: string;
  seats_available: number;
  seats_total: number;
  comp_rate: number;
  notes: string;
  coordinates: any;
  driver_id: string;
  status?: string;
  driver?: {
    id?: string;
    preferred_name: string | null;
    college: string | null;
    year: string | null;
    major: string | null;
    interests?: string[];
    clubs?: string[];
    music_tag: string | null;
    avatar_url?: string | null;
  };
}

interface Props {
  trips: MapTrip[];
  directionFilter?: 'all' | 'to_campus' | 'from_campus';
  searchQuery?: string;
}

function getTripCoords(trip: MapTrip): [number, number] {
  if (trip.coordinates?.lng && trip.coordinates?.lat) return [trip.coordinates.lng, trip.coordinates.lat];
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

function getDestCoords(location: string): [number, number] | null {
  return DEST_COORDS[location] || DESTINATIONS.find(d => d.name === location)?.coords as [number, number] || null;
}

function isExpired(trip: MapTrip): boolean {
  if (trip.status === 'expired' || trip.status === 'completed') return true;
  const dep = new Date(trip.departure_time).getTime();
  return dep < Date.now() - 5 * 60 * 1000;
}

function isToCampus(trip: MapTrip): boolean {
  const dest = trip.to_location.toLowerCase();
  return dest.includes('ucsd') || dest.includes('uc san diego') || dest === 'campus';
}

// Pin color based on direction
function getPinColor(trip: MapTrip): string {
  if (isToCampus(trip)) return '#2563eb'; // blue - to campus
  return '#f59e0b'; // amber - from campus
}

const MapboxMap = ({ trips: externalTrips, directionFilter = 'all', searchQuery = '' }: Props) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<MapTrip | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [myRequestStatus, setMyRequestStatus] = useState<string | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const { profile } = useAuth();
  const { weights: mlWeights } = useMLWeights();

  const token = 'pk.eyJ1IjoiZGhydXYxNGsiLCJhIjoiY21sd3l3bmN0MG4xeDNlcHB2M2ZseXNjciJ9.6IvuBUbVJQm25b83oPIAtw';

  // Filter trips: remove expired, apply direction filter
  const trips = useMemo(() => {
    let filtered = externalTrips.filter(t => !isExpired(t));
    if (directionFilter === 'to_campus') filtered = filtered.filter(t => isToCampus(t));
    if (directionFilter === 'from_campus') filtered = filtered.filter(t => !isToCampus(t));
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.to_location.toLowerCase().includes(q) ||
        (t.from_location || '').toLowerCase().includes(q) ||
        (t.driver?.preferred_name || '').toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [externalTrips, directionFilter, searchQuery]);

  // Compatibility for selected trip
  const compatibility = useMemo(() => {
    if (!selectedTrip?.driver || !profile) return null;
    const a = dbProfileToFeatureProfile(profile as any);
    const b = dbProfileToFeatureProfile(selectedTrip.driver as any);
    return computeMLCompatibilitySync(a, b, mlWeights);
  }, [selectedTrip, profile, mlWeights]);

  // Check existing request for selected trip
  useEffect(() => {
    if (!selectedTrip || !profile || selectedTrip.id.startsWith('mock-')) {
      setMyRequestStatus(null);
      return;
    }
    getMyRequestForTrip(selectedTrip.id, profile.id).then(r => {
      setMyRequestStatus(r?.status || null);
    });
  }, [selectedTrip?.id, profile?.id]);

  // Init map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    mapboxgl.accessToken = token;
    const m = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: UCSD_CENTER,
      zoom: 13.5,
      pitch: 0,
      attributionControl: false,
    });
    m.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');
    map.current = m;

    m.on('load', () => {
      // GeoJSON source for ride pins
      m.addSource('rides', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
        cluster: true,
        clusterMaxZoom: 15,
        clusterRadius: 50,
      });

      // Cluster circles
      m.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'rides',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': 'hsl(213, 70%, 22%)',
          'circle-radius': ['step', ['get', 'point_count'], 22, 5, 28, 10, 34],
          'circle-opacity': 0.85,
          'circle-stroke-width': 2,
          'circle-stroke-color': 'rgba(255,255,255,0.6)',
        },
      });

      // Cluster count text
      m.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'rides',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Pro Bold', 'Arial Unicode MS Bold'],
          'text-size': 13,
        },
        paint: { 'text-color': '#ffffff' },
      });

      // Individual ride pins - circle
      m.addLayer({
        id: 'ride-pins',
        type: 'circle',
        source: 'rides',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-radius': 18,
          'circle-color': ['get', 'pinColor'],
          'circle-opacity': 0.9,
          'circle-stroke-width': 2.5,
          'circle-stroke-color': 'rgba(255,255,255,0.8)',
        },
      });

      // Price label on pin
      m.addLayer({
        id: 'ride-labels',
        type: 'symbol',
        source: 'rides',
        filter: ['!', ['has', 'point_count']],
        layout: {
          'text-field': ['concat', '$', ['get', 'price']],
          'text-font': ['DIN Pro Bold', 'Arial Unicode MS Bold'],
          'text-size': 11,
          'text-allow-overlap': true,
        },
        paint: { 'text-color': '#ffffff' },
      });

      // Heatmap layer (hidden by default)
      m.addSource('heatmap-data', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      m.addLayer({
        id: 'ride-heatmap',
        type: 'heatmap',
        source: 'heatmap-data',
        paint: {
          'heatmap-weight': 1,
          'heatmap-intensity': 0.6,
          'heatmap-radius': 30,
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(0,0,0,0)',
            0.2, 'rgba(59,130,246,0.3)',
            0.4, 'rgba(59,130,246,0.5)',
            0.6, 'rgba(245,158,11,0.6)',
            0.8, 'rgba(239,68,68,0.7)',
            1, 'rgba(239,68,68,0.9)',
          ],
          'heatmap-opacity': 0,
        },
      });

      // Route line layer
      m.addSource('route-line', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      m.addLayer({
        id: 'route-line-layer',
        type: 'line',
        source: 'route-line',
        paint: {
          'line-color': 'hsl(213, 70%, 45%)',
          'line-width': 3,
          'line-dasharray': [2, 2],
          'line-opacity': 0.7,
        },
      });

      // Click handlers
      m.on('click', 'ride-pins', (e) => {
        if (!e.features?.[0]) return;
        const tripId = e.features[0].properties?.tripId;
        const trip = externalTrips.find(t => t.id === tripId);
        if (trip) {
          setSelectedTrip(trip);
          const coords = getTripCoords(trip);
          m.flyTo({ center: coords, zoom: 15, duration: 600 });
        }
      });

      m.on('click', 'clusters', (e) => {
        const features = m.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        if (!features[0]) return;
        const clusterId = features[0].properties?.cluster_id;
        (m.getSource('rides') as mapboxgl.GeoJSONSource).getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err || !features[0].geometry || features[0].geometry.type !== 'Point') return;
          m.easeTo({ center: features[0].geometry.coordinates as [number, number], zoom: zoom! });
        });
      });

      // Cursor
      m.on('mouseenter', 'ride-pins', () => { m.getCanvas().style.cursor = 'pointer'; });
      m.on('mouseleave', 'ride-pins', () => { m.getCanvas().style.cursor = ''; });
      m.on('mouseenter', 'clusters', () => { m.getCanvas().style.cursor = 'pointer'; });
      m.on('mouseleave', 'clusters', () => { m.getCanvas().style.cursor = ''; });
    });

    return () => { m.remove(); map.current = null; };
  }, []);

  // Update GeoJSON data when trips change
  useEffect(() => {
    if (!map.current) return;
    const m = map.current;
    
    const waitForSource = () => {
      if (!m.getSource('rides')) {
        setTimeout(waitForSource, 100);
        return;
      }

      const features = trips.map(trip => {
        const coords = getTripCoords(trip);
        return {
          type: 'Feature' as const,
          properties: {
            tripId: trip.id,
            price: trip.comp_rate,
            seats: trip.seats_available,
            pinColor: getPinColor(trip),
            destination: trip.to_location,
          },
          geometry: { type: 'Point' as const, coordinates: coords },
        };
      });

      (m.getSource('rides') as mapboxgl.GeoJSONSource)?.setData({
        type: 'FeatureCollection',
        features,
      });

      // Heatmap data
      (m.getSource('heatmap-data') as mapboxgl.GeoJSONSource)?.setData({
        type: 'FeatureCollection',
        features,
      });
    };

    waitForSource();
  }, [trips]);

  // Toggle heatmap
  useEffect(() => {
    if (!map.current) return;
    const m = map.current;
    const setOpacity = () => {
      if (m.getLayer('ride-heatmap')) {
        m.setPaintProperty('ride-heatmap', 'heatmap-opacity', showHeatmap ? 0.7 : 0);
      }
    };
    if (m.isStyleLoaded()) setOpacity();
    else m.on('load', setOpacity);
  }, [showHeatmap]);

  // Draw route line when trip is selected
  useEffect(() => {
    if (!map.current) return;
    const m = map.current;
    const setRoute = () => {
      const source = m.getSource('route-line') as mapboxgl.GeoJSONSource;
      if (!source) return;

      if (!selectedTrip) {
        source.setData({ type: 'FeatureCollection', features: [] });
        return;
      }

      const start = getTripCoords(selectedTrip);
      const destCoords = getDestCoords(selectedTrip.to_location);
      if (!destCoords) {
        source.setData({ type: 'FeatureCollection', features: [] });
        return;
      }

      source.setData({
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [start, destCoords],
          },
        }],
      });
    };
    if (m.isStyleLoaded()) setRoute();
    else m.on('load', setRoute);
  }, [selectedTrip]);

  const handleRequestRide = async () => {
    if (!profile || !selectedTrip) return;
    if (selectedTrip.id.startsWith('mock-')) {
      toast.info('Demo trip — sign up as a driver to create real trips!');
      return;
    }
    setRequesting(true);
    const { error } = await requestSeat(selectedTrip.id, profile.id);
    if (error) {
      toast.error('Failed to request ride');
    } else {
      toast.success('Ride requested! 🎉');
      setMyRequestStatus('pending');
    }
    setRequesting(false);
  };

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-2xl overflow-hidden border border-border shadow-sm">
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Top-right controls */}
      <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
        <div className="bg-card/90 backdrop-blur-md px-3 py-2 rounded-lg border border-border shadow-sm">
          <span className="text-xs font-medium text-muted-foreground">{trips.length} ride{trips.length !== 1 ? 's' : ''}</span>
        </div>
        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border shadow-sm text-xs font-medium transition-all ${
            showHeatmap ? 'bg-destructive/10 border-destructive/30 text-destructive' : 'bg-card/90 backdrop-blur-md border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          Heat
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-md px-3 py-2 rounded-lg border border-border shadow-sm z-10 flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#2563eb]" />
          <span className="text-[10px] text-muted-foreground">To Campus</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
          <span className="text-[10px] text-muted-foreground">From Campus</span>
        </div>
      </div>

      {/* Bottom sheet for selected trip */}
      <AnimatePresence>
        {selectedTrip && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 sm:bottom-4 sm:left-auto sm:right-4 sm:w-[380px] bg-card rounded-t-2xl sm:rounded-2xl border border-border shadow-2xl z-30"
          >
            {/* Drag handle (mobile) */}
            <div className="flex justify-center py-2 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>

            <div className="px-5 pb-5 pt-2 sm:p-5">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold overflow-hidden ring-2 ring-border cursor-pointer"
                    onClick={() => window.location.href = `/profile/${selectedTrip.driver_id}`}
                  >
                    {selectedTrip.driver?.avatar_url ? (
                      <img src={selectedTrip.driver.avatar_url} className="w-full h-full object-cover" alt="" />
                    ) : (
                      (selectedTrip.driver?.preferred_name || 'D').charAt(0)
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{selectedTrip.driver?.preferred_name || 'Driver'}</p>
                    <p className="text-xs text-muted-foreground">{selectedTrip.driver?.college} · {selectedTrip.driver?.year}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedTrip(null)} className="p-1.5 rounded-full hover:bg-muted transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Direction badge */}
              <div className="flex items-center gap-2 mb-3">
                <div className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                  isToCampus(selectedTrip) ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
                }`}>
                  {isToCampus(selectedTrip) ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                  {isToCampus(selectedTrip) ? 'To Campus' : 'From Campus'}
                </div>
              </div>

              {/* Trip details grid */}
              <div className="grid grid-cols-2 gap-2.5 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-primary/60 shrink-0" />
                  <span className="font-medium text-foreground truncate">{selectedTrip.to_location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-primary/60 shrink-0" />
                  <span className="text-muted-foreground">{formatDepartureTime(selectedTrip.departure_time)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-primary/60 shrink-0" />
                  <span className="text-muted-foreground">${selectedTrip.comp_rate}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-primary/60 shrink-0" />
                  <span className="text-muted-foreground">{selectedTrip.seats_available}/{selectedTrip.seats_total} seats</span>
                </div>
              </div>

              {selectedTrip.notes && (
                <p className="text-xs text-muted-foreground italic mb-3 line-clamp-2">"{selectedTrip.notes}"</p>
              )}

              {/* Compatibility */}
              {compatibility && (
                <div className="p-3 rounded-lg bg-secondary/10 border border-secondary/20 mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-secondary" />
                    <span className="text-sm font-bold text-secondary">{compatibility.score}% match</span>
                  </div>
                  {compatibility.reasons.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {compatibility.reasons.slice(0, 3).map((r, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{r}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Action button */}
              {myRequestStatus === 'pending' ? (
                <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-warning/10 text-warning text-sm font-medium">
                  <Loader2 className="w-4 h-4 animate-spin" /> Requested
                </div>
              ) : myRequestStatus === 'accepted' ? (
                <div className="w-full py-2.5 rounded-lg bg-success/10 text-success text-sm font-medium text-center">
                  ✅ You're in!
                </div>
              ) : (
                <button
                  onClick={handleRequestRide}
                  disabled={selectedTrip.seats_available === 0 || requesting}
                  className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {requesting ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : selectedTrip.seats_available > 0 ? (
                    'Request Ride'
                  ) : (
                    'No Seats Available'
                  )}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MapboxMap;
