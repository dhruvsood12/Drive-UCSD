import { useState } from 'react';
import { useTrips } from '@/hooks/useTrips';
import { useAuth } from '@/contexts/AuthContext';
import FiltersBar from './FiltersBar';
import MapboxMap from './MapboxMap';

const RealMapPage = () => {
  const [destination, setDestination] = useState<string | null>(null);
  const [timeWindow, setTimeWindow] = useState<string | null>(null);
  const { trips, loading } = useTrips({ destination, timeWindow });

  const mapTrips = trips.map(t => ({
    id: t.id,
    to_location: t.to_location,
    departure_time: t.departure_time,
    seats_available: t.seats_available,
    seats_total: t.seats_total,
    comp_rate: Number(t.comp_rate),
    notes: t.notes,
    coordinates: t.coordinates,
    driver_id: t.driver_id,
    driver: t.driver ? {
      preferred_name: t.driver.preferred_name,
      college: t.driver.college,
      year: t.driver.year,
      major: t.driver.major,
    } : undefined,
  }));

  return (
    <div className="max-w-5xl mx-auto">
      <RealFiltersBar destination={destination} setDestination={setDestination} timeWindow={timeWindow} setTimeWindow={setTimeWindow} />
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <MapboxMap trips={mapTrips} />
      )}
    </div>
  );
};

const DESTINATIONS = ['Pacific Beach', 'Downtown', 'Grocery', 'Airport'];
const TIME_WINDOWS = [
  { value: 'now', label: 'Now' },
  { value: '1hr', label: '< 1 hr' },
  { value: 'today', label: 'Today' },
];

const RealFiltersBar = ({ destination, setDestination, timeWindow, setTimeWindow }: {
  destination: string | null;
  setDestination: (v: string | null) => void;
  timeWindow: string | null;
  setTimeWindow: (v: string | null) => void;
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
    <div className="flex flex-wrap gap-2">
      <button onClick={() => setDestination(null)} className={`chip ${!destination ? 'chip-active' : 'chip-inactive'}`}>All</button>
      {DESTINATIONS.map(d => (
        <button key={d} onClick={() => setDestination(destination === d ? null : d)} className={`chip ${destination === d ? 'chip-active' : 'chip-inactive'}`}>{d}</button>
      ))}
    </div>
    <select
      value={timeWindow || ''}
      onChange={e => setTimeWindow(e.target.value || null)}
      className="h-9 px-3 rounded-lg border border-border bg-card text-card-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <option value="">Any time</option>
      {TIME_WINDOWS.map(tw => <option key={tw.value} value={tw.value}>{tw.label}</option>)}
    </select>
  </div>
);

export default RealMapPage;
